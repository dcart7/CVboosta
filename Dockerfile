FROM python:3.11-slim

WORKDIR /app

# Ensure tzdata and basic compiling tools are available if needed
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    libgomp1 \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Since context is mapped to root (.), we must copy from the nested backend folder
COPY backend/requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

# Copy ML folder correctly inside /app
COPY ml ./ml

# Copy Backend app code inside /app/app
# We need to maintain the "app.main:app" structure
COPY backend/app ./app

# Add PYTHONPATH so absolute paths like "app.core" can resolve cleanly
ENV PYTHONPATH=/app

EXPOSE 8000

# Cloud Run requires the server to listen on $PORT
# We use a shell-exec form to ensure $PORT is expanded
CMD exec uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8080} --workers 2 --proxy-headers
