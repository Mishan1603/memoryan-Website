"""
Phase A: HTTP API for YouTube → audio (mp3) via yt-dlp.
Optional: Netscape cookies from Redis key ytdlp:cookies:netscape (manual seed for Phase A).
"""
from __future__ import annotations

import asyncio
import logging
import os
import shutil
import subprocess
import tempfile
import time
import uuid
from dataclasses import dataclass
from threading import Lock

from fastapi import Depends, FastAPI, Header, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field

logging.basicConfig(level=logging.INFO)
log = logging.getLogger("ytdlp-api")

app = FastAPI(title="Memoryan yt-dlp API", version="0.1.0")

REDIS_URL = os.environ.get("REDIS_URL", "").strip()
COOKIE_REDIS_KEY = os.environ.get("YTDLP_COOKIE_REDIS_KEY", "ytdlp:cookies:netscape")
API_KEY = os.environ.get("YTDLP_API_KEY", "").strip()
YTDLP_RETRIES = max(1, int(os.environ.get("YTDLP_RETRIES", "3")))
YTDLP_BACKOFF_BASE = float(os.environ.get("YTDLP_BACKOFF_BASE", "1.5"))
STREAM_TTL_SEC = max(60, int(os.environ.get("YTDLP_STREAM_TTL_SEC", "600")))
MAX_MB = max(5, int(os.environ.get("YTDLP_MAX_OUTPUT_MB", "40")))

_redis = None
if REDIS_URL:
    try:
        import redis as redis_lib

        _redis = redis_lib.Redis.from_url(REDIS_URL, decode_responses=True, socket_connect_timeout=3)
        _redis.ping()
        log.info("Redis connected for optional cookies")
    except Exception as e:
        log.warning("REDIS_URL set but connection failed: %s — cookies disabled", e)
        _redis = None


@dataclass
class StreamEntry:
    path: str
    expires: float


_streams: dict[str, StreamEntry] = {}
_streams_lock = Lock()


def _prune_streams() -> None:
    now = time.time()
    with _streams_lock:
        dead = [k for k, v in _streams.items() if v.expires < now]
        for k in dead:
            ent = _streams.pop(k, None)
            if ent and os.path.isfile(ent.path):
                try:
                    os.remove(ent.path)
                except OSError:
                    pass


def load_cookies_file() -> str | None:
    """Write cookies from Redis to a temp file; return path or None."""
    if _redis is None:
        return None
    try:
        raw = _redis.get(COOKIE_REDIS_KEY)
        if not raw or not raw.strip():
            return None
        fd, path = tempfile.mkstemp(prefix="yt-cookies-", suffix=".txt")
        os.write(fd, raw.encode("utf-8"))
        os.close(fd)
        return path
    except Exception as e:
        log.warning("Could not load cookies from Redis: %s", e)
        return None


def verify_api_key(x_api_key: str | None = Header(None, alias="X-API-Key")) -> None:
    if not API_KEY:
        raise HTTPException(500, detail="YTDLP_API_KEY not set on server")
    if not x_api_key or x_api_key != API_KEY:
        raise HTTPException(401, detail="Unauthorized")


class ExtractBody(BaseModel):
    url: str = Field(..., min_length=10, max_length=2048)


def run_ytdlp(url: str, out_template: str, cookies_path: str | None) -> None:
    cmd = [
        "yt-dlp",
        "--no-playlist",
        "--no-warnings",
        "-f",
        "ba/b",
        "-x",
        "--audio-format",
        "mp3",
        "--audio-quality",
        "5",
        "-o",
        out_template,
        url,
    ]
    if cookies_path:
        cmd.insert(1, "--cookies")
        cmd.insert(2, cookies_path)

    proc = subprocess.run(
        cmd,
        capture_output=True,
        text=True,
        timeout=240,
        env={**os.environ, "PYTHONUNBUFFERED": "1"},
    )
    if proc.returncode != 0:
        err = (proc.stderr or proc.stdout or "").strip()[:4000]
        log.error("yt-dlp failed rc=%s: %s", proc.returncode, err)
        raise RuntimeError(err or "yt-dlp failed")


def find_output_file(directory: str, job_id: str) -> str | None:
    for name in os.listdir(directory):
        if name.startswith(job_id) and name.endswith(".mp3"):
            return os.path.join(directory, name)
    for name in os.listdir(directory):
        if name.endswith(".mp3"):
            return os.path.join(directory, name)
    return None


async def extract_with_retries(url: str) -> tuple[str, str]:
    """Returns (absolute_path_to_mp3, stream_token)."""
    last_err: Exception | None = None
    cookies_tmp = load_cookies_file()
    try:
        for attempt in range(YTDLP_RETRIES):
            job_id = uuid.uuid4().hex[:12]
            tmpdir = tempfile.mkdtemp(prefix="ytdlp-job-")
            try:
                out_tmpl = os.path.join(tmpdir, f"{job_id}.%(ext)s")
                await asyncio.to_thread(run_ytdlp, url, out_tmpl, cookies_tmp)
                mp3 = await asyncio.to_thread(find_output_file, tmpdir, job_id)
                if not mp3 or not os.path.isfile(mp3):
                    raise RuntimeError("No mp3 produced")
                size = os.path.getsize(mp3)
                if size > MAX_MB * 1024 * 1024:
                    raise RuntimeError("output_too_large")
                if size < 256:
                    raise RuntimeError("output_too_small")

                token = uuid.uuid4().hex
                final = tempfile.NamedTemporaryFile(prefix="ytdlp-", suffix=".mp3", delete=False)
                final.close()
                shutil.move(mp3, final.name)
                shutil.rmtree(tmpdir, ignore_errors=True)

                with _streams_lock:
                    _streams[token] = StreamEntry(path=final.name, expires=time.time() + STREAM_TTL_SEC)

                return final.name, token
            except Exception as e:
                last_err = e
                shutil.rmtree(tmpdir, ignore_errors=True)
                delay = YTDLP_BACKOFF_BASE**attempt
                log.warning("attempt %s failed: %s (retry in %.1fs)", attempt + 1, e, delay)
                await asyncio.sleep(delay)
    finally:
        if cookies_tmp and os.path.isfile(cookies_tmp):
            try:
                os.remove(cookies_tmp)
            except OSError:
                pass

    raise HTTPException(502, detail=str(last_err) if last_err else "yt-dlp failed after retries")


@app.get("/health")
def health():
    _prune_streams()
    cookie_ready = False
    if _redis:
        try:
            cookie_ready = bool(_redis.get(COOKIE_REDIS_KEY))
        except Exception:
            pass
    return {"ok": True, "redis": bool(_redis), "cookies_in_redis": cookie_ready}


@app.post("/v1/extract")
async def v1_extract(body: ExtractBody, _: None = Depends(verify_api_key)):
    _prune_streams()
    low = body.url.lower()
    if "youtube.com" not in low and "youtu.be" not in low:
        raise HTTPException(400, detail="Only YouTube URLs supported in Phase A")

    _path, token = await extract_with_retries(body.url)
    del _path

    base = os.environ.get("PUBLIC_BASE_URL", "").rstrip("/")
    if not base:
        with _streams_lock:
            ent = _streams.pop(token, None)
        if ent and os.path.isfile(ent.path):
            try:
                os.remove(ent.path)
            except OSError:
                pass
        raise HTTPException(
            500,
            detail="Set PUBLIC_BASE_URL to your public Railway URL (e.g. https://ytdlp-xxx.up.railway.app)",
        )

    stream_url = f"{base}/v1/stream/{token}"
    log.info("extract ok token=%s", token[:8])
    return {
        "status": "ok",
        "audio_url": stream_url,
        "expires_in": STREAM_TTL_SEC,
    }


@app.get("/v1/stream/{token}")
async def v1_stream(token: str, _: None = Depends(verify_api_key)):
    _prune_streams()
    with _streams_lock:
        ent = _streams.pop(token, None)
    if not ent or ent.expires < time.time():
        raise HTTPException(404, detail="expired or unknown token")
    path = ent.path
    if not os.path.isfile(path):
        raise HTTPException(404, detail="file gone")

    def iterfile():
        try:
            with open(path, "rb") as f:
                while True:
                    chunk = f.read(1024 * 256)
                    if not chunk:
                        break
                    yield chunk
        finally:
            try:
                os.remove(path)
            except OSError:
                pass

    headers = {"Content-Disposition": 'attachment; filename="audio.mp3"'}
    return StreamingResponse(iterfile(), media_type="audio/mpeg", headers=headers)
