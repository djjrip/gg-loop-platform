FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Create non-root user
RUN useradd -m -u 1001 bot && \
    chown -R bot:bot /app
USER bot

EXPOSE 3001

CMD ["python", "app.py"]
