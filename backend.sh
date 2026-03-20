#!/bin/bash

echo "Deleting docker images"
sudo docker system prune -a

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

if [ -d "venv" ]; then
  source venv/bin/activate
elif [ -d ".venv" ]; then
  source .venv/bin/activate
else
  echo "No virtual environment found in backend/ (expected venv or .venv)"
  exit 1
fi

echo "Updating Pip"
pip3 install --upgrade pip

echo "Installing dependencies"
pip3 install -r requirements.txt



echo "Starting server"
python3 main.py

echo "Server started"