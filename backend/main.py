import uvicorn
import os
from dotenv import load_dotenv

load_dotenv()

if __name__ == "__main__":
    uvicorn.run("app.api:app", host="0.0.0.0", port=int(os.getenv("PORT")), reload=True, reload_dirs=["app"])
    
    
#  100.119.189.80
# run the server with the command: python main.py
# kill -9 $(lsof -t -i:8000)