from fastapi import FastAPI, UploadFile, File, Form, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
import uuid
import json
import asyncio
from functools import partial
from . import sql_py
from . import testsubprocess
app = FastAPI()


def normalize_api_path(path: str | None, default_path: str) -> str:
    resolved_path = (path or default_path).strip()
    if not resolved_path:
        return default_path
    if not resolved_path.startswith("/"):
        return f"/{resolved_path}"
    return resolved_path


SIGNIN_API_URL = normalize_api_path(os.getenv("SIGNIN_API_URL"), "/signInAPI")
CREATE_ACCOUNT_API_URL = normalize_api_path(
    os.getenv("CREATE_ACCOUNT_API_URL"),
    "/createAccountAPI",
)
# origins = [
#     "http://localhost:5173",
#     "localhost:5173"
# ]
origins = ["*"]


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

# UPLOAD_DIR = "/home/aman/Projects/ucm-computing/backend/train"
print(os.getcwd())
#UPLOAD_DIR = "/home/aman/Projects/ucm-computing/backend/train"
UPLOAD_DIR = os.getenv("UPLOAD_DIR") or ""
print(f"UPLOAD_DIR: {UPLOAD_DIR}")


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    while True:
        data = await websocket.receive_text()
        print(f"Received: {data}")
        await websocket.send_text(f"Message received: {data}")


@app.post("/jsonPythonFile", tags=["jsonPythonFile"])
async def jsonPythonFile(metadata: str = Form(...), python_files: list[UploadFile] = File(...), user_uuid: str = Form(...)) -> dict:
    print("jsonPythonFile print")
    print(f"metadata: {metadata}")
    print(f"user_uuid: ------{user_uuid}------")
    # json_data = json.loads(metadata)
    # user_upload_dir = os.path.join(UPLOAD_DIR, user_uuid)
    # os.makedirs(user_upload_dir, exist_ok=True)
    # json_path = os.path.join(user_upload_dir, "parameters.json")
    # with open(json_path, "w") as f:
    #     json.dump(json_data, f)
    # print(f"json_data: {json_data}")
    # print(f"python_files: {python_files}")
    # subprocess.run(["python", f"{UPLOAD_DIR}/test.py", "--epochs", json_data["hyperparameters"]["epochs"], "--learning_rate", json_data["hyperparameters"]["learning_rate"], "--batch_size", json_data["hyperparameters"]["batch_size"], "--num_workers", json_data["hyperparameters"]["num_workers"], "--pin_memory", json_data["hyperparameters"]["pin_memory"]])
    # for file in python_files:
    #     print(f"file: {file}")
    #     file_path = os.path.join(user_upload_dir, file.filename)
    #     with open(file_path, "wb") as f:
    #         f.write(await file.read())
    
    prepared_files: list[testsubprocess.UploadedTrainingFile] = []
    for file in python_files:
        if not file.filename:
            return {"message": "Uploaded file is missing a filename.", "success": False}
        prepared_files.append(
            {
                "filename": file.filename,
                "content": await file.read(),
            }
        )
        await file.close()

    print(f"Prepared {len(prepared_files)} files for Docker build")

    # Run in background thread so FastAPI doesn't block while training runs
    loop = asyncio.get_running_loop()
    loop.run_in_executor(
        None,
        partial(testsubprocess.run_command, user_uuid, metadata, prepared_files),
    )

    return {"message": "Training started successfully.", "success": True}




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

@app.post(SIGNIN_API_URL, tags=["signInAPI"])
async def SignInAPI(signIn: SignIn) -> dict:
    print("SignInAPI is called, signIn: ", signIn)
    sql = sql_py.SQL()
    sql.create_table()
    user = sql.get_user(signIn.email, signIn.password)
    if user is None:
        return {"message": "Invalid email or password.", "success": False, "userUUID": None}
    user_data = {
        "uuid": user[0],
        "name": user[1],
        "email": user[2],
        "password": user[3],
    }
    print(f"user: {user}")
    print(f"user type: {type(user)}")
    print(f"user uuid: {user[0]}")
    print(f"user name: {user[1]}")
    print(f"user email: {user[2]}")
    print(f"user password: {user[3]}")
    return {"message": "Sign in successful.", "success": True, "user": user_data}


class CreateAccount(BaseModel):
    name: str
    email: str
    password: str

@app.post(CREATE_ACCOUNT_API_URL, tags=["createAccountAPI"])
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
