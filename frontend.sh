
PID=$(lsof -t -i:5173)

if [ ! -z "$PID" ]; then
  kill -9 $PID
  echo "Killed process $PID"
fi

cd frontend
npm run dev

echo "Frontend started"
echo "Frontend is running on http://localhost:5173"


# chmod +x frontend.sh && ./frontend.sh