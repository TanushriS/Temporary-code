FROM python:3.11-slim

WORKDIR /app

# Install system dependencies first (some Python packages need them)
RUN apt-get update && apt-get install -y \
    gcc \
    python3-dev \
    && rm -rf /var/lib/apt/lists/*

# Install PyTorch first with its dependencies
RUN pip install --no-cache-dir torch==2.7.1+cpu --index-url https://download.pytorch.org/whl/cpu

# Then install the rest of requirements
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt --timeout=1000

COPY . .

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
