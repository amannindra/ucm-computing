#!/bin/bash

echo "Stopping anything running on port 8000..."

PID=$(lsof -t -i:8000)

if [ ! -z "$PID" ]; then
  kill -9 $PID
  echo "Killed process $PID"
fi

cd backend

echo "Checking current folder"
pwd


echo "Activating virtual environment"
# source venv/bin/activate <-- Linux
source .venv/bin/activate # Mac

# backend/.venv/bin/activate

echo "Starting server"
python3 main.py

echo "Server started"

# chmod +x backend.sh && ./backend.sh
