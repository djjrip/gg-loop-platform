#!/usr/bin/env python3
"""Simple test server to verify Railway deployment"""
from flask import Flask
import os

app = Flask(__name__)

@app.route('/')
def index():
    return "Options Hunter is ALIVE! ✅"

@app.route('/health')
def health():
    return {"status": "healthy", "port": os.getenv('PORT', '8700')}

if __name__ == '__main__':
    port = int(os.getenv('PORT', 8700))
    print(f"Starting test server on port {port}")
    app.run(host='0.0.0.0', port=port)
