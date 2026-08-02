FROM python:3.11

WORKDIR /app

# Ensure logs are sent straight to terminal without buffering
ENV PYTHONUNBUFFERED=1
ENV PORT=8080

# Ensure tzdata and basic compiling tools are available if needed
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    libgomp1 \
    libgl1 \
    libglib2.0-0 \
    python3-dev \
    gcc \
    g++ \
    cmake \
    pkg-config \
    && rm -rf /var/lib/apt/lists/*

# Since context is mapped to root (.), we must copy from the nested backend folder
COPY backend/requirements.txt .

# Upgrade pip and build tools
RUN pip install --no-cache-dir --upgrade pip setuptools wheel

RUN pip install --no-cache-dir -r requirements.txt

# Copy ML folder correctly inside /app
COPY ml ./ml

# Copy all backend code explicitly
COPY backend/app /app/app
COPY backend/migrations /app/migrations
COPY backend/scripts/run_migrations.py /app/scripts/run_migrations.py

# Add PYTHONPATH so absolute paths like "app.core" can resolve cleanly
ENV PYTHONPATH=/app

# Run the public API and AI worker without root privileges. The application
# only needs read access to its code/models and writes temporary files to /tmp.
RUN groupadd --gid 10001 cvboosta \
    && useradd --uid 10001 --gid cvboosta --no-create-home --shell /usr/sbin/nologin cvboosta \
    && chown -R cvboosta:cvboosta /app

USER cvboosta

EXPOSE 8080

# Cloud Run requires the server to listen on $PORT
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8080} --proxy-headers"]
