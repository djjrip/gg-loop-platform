#!/usr/bin/env bash
set -euo pipefail

# Activate venv if present
if [ -d ".venv" ]; then
  # shellcheck disable=SC1091
  source .venv/bin/activate
fi

PORT=${PORT:-8501}

# Prefer config.toml but allow override via PORT env
exec streamlit run app.py --server.port="$PORT" --server.headless=true
