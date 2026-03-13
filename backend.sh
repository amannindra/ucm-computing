#!/bin/bash
cd backend
echo "Activating virtual environment"
source venv/bin/activate
echo "Starting server"
python main.py

echo "Server started"

kill -9 $(lsof -t -i:8000)
chmod +x backend.sh && ./backend.sh
