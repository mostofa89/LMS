#!/bin/bash
set -e
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR/backend"

# Activate virtual environment
if [ ! -d "venv" ]; then
  echo "Creating virtual environment..."
  python3 -m venv venv
fi

echo "Activating virtual environment..."
source venv/bin/activate

echo "Installing/verifying dependencies..."
pip install -r requirements.txt -q

echo "Running migrations..."
python manage.py migrate

echo "Starting EduFlow Backend on http://localhost:8000"
python manage.py runserver 0.0.0.0:8000
