FROM python:3.12-slim-bookworm

RUN apt-get update && apt-get install -y --no-install-recommends ffmpeg ca-certificates curl \
    && rm -rf /var/lib/apt/lists/* \
    && curl -fsSL -o /usr/local/bin/yt-dlp https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp \
    && chmod a+rx /usr/local/bin/yt-dlp

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY app ./app

ENV PORT=8080
EXPOSE 8080

CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8080}"]
