from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os 
import uuid
from . import sql_py
import json
import subprocess
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

UPLOAD_DIR = "/home/aman/Projects/ucm-computing/backend/train"

os.makedirs(UPLOAD_DIR, exist_ok=True)

@app.post("/jsonPythonFile", tags=["jsonPythonFile"])

async def jsonPythonFile(metadata: str = Form(...), python_files: list[UploadFile] = File(...)) -> dict:
    print("jsonPythonFile")
    print(f"metadata: {metadata}")
    json_data = json.loads(metadata)
    print(f"json_data: {json_data}")
    print(f"python_files: {python_files}")
    # subprocess.run(["python", f"{UPLOAD_DIR}/test.py", "--epochs", json_data["hyperparameters"]["epochs"], "--learning_rate", json_data["hyperparameters"]["learning_rate"], "--batch_size", json_data["hyperparameters"]["batch_size"], "--num_workers", json_data["hyperparameters"]["num_workers"], "--pin_memory", json_data["hyperparameters"]["pin_memory"]])
    for file in python_files:
        print(f"file: {file}")
        file_path = os.path.join(UPLOAD_DIR, file.filename)
        with open(file_path, "wb") as f:
            f.write(await file.read())
            
            
    return {"message": "JSON and Python files uploaded successfully.", "success": True}




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
    return {"message": "Training started.", "success": True}




@app.post("/pythonFile", tags=["pythonFile"])
async def UploadPythonFile(python_files: list[UploadFile] = File(...)) -> dict:
    for file in python_files:
        print(f"file: {file}")
        file_path = os.path.join(UPLOAD_DIR, file.filename)
        with open(file_path, "wb") as f:
            f.write(await file.read())
    return {"message": "Python files uploaded successfully.", "success": True}


class TrainFile(BaseModel):
    file: UploadFile = File(...)

@app.post("/train", tags=["train"])
async def TrainModel(train: TrainFile) -> dict:
    file_path = os.path.join(UPLOAD_DIR, train.file.filename)
    with open(file_path, "wb") as f:
        f.write(await train.file.read())

    return {"message": "Training started.", "success": True}


class SignIn(BaseModel):
    email: str
    password: str

@app.post("/signInAPI", tags=["signInAPI"])
async def SignInAPI(signIn: SignIn) -> dict:
    sql = sql_py.SQL()
    sql.create_table()
    user = sql.get_user(signIn.email, signIn.password)
    if user is None:
        return {"message": "Invalid email or password.", "success": False, "userUUID": None}
    print(f"user: {user}")
    print(f"user type: {type(user)}")
    print(f"user uuid: {user[0]}")
    print(f"user name: {user[1]}")
    print(f"user email: {user[2]}")
    print(f"user password: {user[3]}")
    return {"message": "Sign in successful.", "success": True, "user": user}


class CreateAccount(BaseModel):
    name: str
    email: str
    password: str

@app.post("/createAccountAPI", tags=["createAccountAPI"])
async def CreateAccountAPI(createAccount: CreateAccount) -> dict:
    print(f"name: {createAccount.name}")
    print(f"email: {createAccount.email}")
    print(f"password: {createAccount.password}")
    id = str(uuid.uuid4())
    sql = sql_py.SQL()
    sql.create_table()
    if sql.check_user_exists(createAccount.email):
        return {"message": "Email already exists.", "success": False}
    sql.insert_user(id, createAccount.name, createAccount.email, createAccount.password)
    res = sql.get_users()
    print(res)
    return {"message": "Account created successfully.", "success": True}

