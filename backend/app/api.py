from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os 


app = FastAPI()

origins = [
    "http://localhost:5173",
    "localhost:5173"
]


app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)


@app.get("/", tags=["root"])
async def read_root() -> dict:
    return {"message": "Welcome to UCM Computing."}



class Parameters(BaseModel):
    pytorch_version: float
    use_cuda: bool
    model_name: str
    dependencies: str
    hyperparameters: dict


@app.post("/parameters", tags=["parameters"])
async def GetParameters(parameters: Parameters) -> dict:
    print("returning parameters")
    # print(f"parameters: {parameters}")
    # print(f"parameters type: {type(parameters)}")
    print(f"parameters pytorch_version: {parameters.pytorch_version}")
    print(f"parameters use_cuda: {parameters.use_cuda}")
    print(f"parameters model_name: {parameters.model_name}")
    print(f"parameters dependencies: {parameters.dependencies}")
    print(f"parameters hyperparameters: {parameters.hyperparameters}")
    return {"message": "Training started."} 



class TrainFile(BaseModel):
    file: UploadFile = File(...)

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@app.post("/pythonFile", tags=["pythonFile"])
async def UploadPythonFile(python_files: list[UploadFile] = File(...)) -> dict:
    for file in python_files:
        print(f"file: {file}")
        file_path = os.path.join(UPLOAD_DIR, file.filename)
        with open(file_path, "wb") as f:
            f.write(await file.read())
    return {"message": "Python files uploaded successfully."}




@app.post("/train", tags=["train"])
async def TrainModel(train: TrainFile) -> dict:
    file_path = os.path.join(UPLOAD_DIR, train.file.filename)
    with open(file_path, "wb") as f:
        f.write(await train.file.read())
    
    return {"message": "Training started."}