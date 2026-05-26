FROM python:3.11-slim

WORKDIR /app

# Required for audio handling and health checks
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies first for better Docker caching
COPY requirements.txt .
RUN python -m pip install --no-cache-dir --upgrade pip \
    && python -m pip install --no-cache-dir -r requirements.txt

# Copy backend application code
COPY app.py .
COPY backend ./backend

# Folders used by your FastAPI application
RUN mkdir -p uploads audio

# Hugging Face Docker Spaces default public port
EXPOSE 7860

CMD ["python", "-m", "uvicorn", "app:app", "--host", "0.0.0.0", "--port", "7860"]