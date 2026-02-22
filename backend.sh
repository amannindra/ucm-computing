#!/bin/bash
cd backend
echo "Activating virtual environment"
source .venv/bin/activate
echo "Starting server"
python main.py

echo "Server started"


chmod +x backend.sh && ./backend.sh
