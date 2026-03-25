from fastapi import FastAPI, UploadFile, File, Form, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
import re
import uuid
import json
import asyncio
from functools import partial
from datetime import datetime
from minio import Minio
from urllib.parse import urlsplit
# from minio.args import SourceObject
from . import sql_py
from . import testsubprocess

app = FastAPI()

USER_TABLE_COLUMNS = [
    "uuid TEXT PRIMARY KEY",
    "name TEXT NOT NULL",
    "email TEXT NOT NULL UNIQUE",
    "password TEXT NOT NULL",
]
USER_COLUMNS = ["uuid", "name", "email", "password"]
USER_BUCKET_TABLE_COLUMNS = [
    "id INTEGER PRIMARY KEY AUTOINCREMENT",
    "user_uuid TEXT NOT NULL",
    "bucket_name TEXT NOT NULL UNIQUE",
    "created_at TEXT NOT NULL DEFAULT ''",
]
USER_BUCKET_COLUMNS = ["user_uuid", "bucket_name", "created_at"]
BUCKET_NAME_PATTERN = re.compile(r"^[a-z0-9][a-z0-9-]{1,61}[a-z0-9]$")


database_db = "data.db"

def resolve_minio_endpoint(raw_endpoint: str | None) -> tuple[str, bool]:
    endpoint = (raw_endpoint or "127.0.0.1:9000").strip()
    secure_override = os.getenv("MINIO_SECURE")
    secure = (
        secure_override.strip().lower() in {"1", "true", "yes", "on"}
        if secure_override
        else False
    )

    if "://" in endpoint:
        parsed_endpoint = urlsplit(endpoint)
        endpoint = parsed_endpoint.netloc or parsed_endpoint.path
        if secure_override is None:
            secure = parsed_endpoint.scheme == "https"
        if parsed_endpoint.path not in {"", "/"}:
            print(
                f"MINIO_ENDPOINT contains path '{parsed_endpoint.path}'. "
                f"Using '{endpoint}' instead."
            )

    endpoint = endpoint.rstrip("/")
    return endpoint, secure


MINIO_ENDPOINT, MINIO_SECURE = resolve_minio_endpoint(os.getenv("MINIO_ENDPOINT"))
minio_client = Minio(
    endpoint=MINIO_ENDPOINT,
    access_key=os.getenv("MINIO_ACCESS_KEY"),
    secret_key=os.getenv("MINIO_SECRET_KEY"),
    secure=MINIO_SECURE,
)

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


# @app.post("/parameters", tags=["parameters"])
# async def GetParameters(parameters: Parameters) -> dict:
#     print("returning parameters")
#     # print(f"parameters: {parameters}")
#     # print(f"parameters type: {type(parameters)}")
#     print(f"parameters pytorch_version: {parameters.pytorch_version}")
#     print(f"parameters use_cuda: {parameters.use_cuda}")
#     print(f"parameters model_name: {parameters.model_name}")
#     print(f"parameters dependencies: {parameters.dependencies}")
#     print(f"parameters hyperparameters: {parameters.hyperparameters}")
#     return {"message": "Training started.", "success": True}


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
    try:
        sql.create_table("users", USER_TABLE_COLUMNS)
        user = sql.get_data("users", USER_COLUMNS, "email", signIn.email)
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
    finally:
        sql.close()

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
    id = id.replace("-", "")
    sql = sql_py.SQL()
    try:
        sql.create_table("users", USER_TABLE_COLUMNS)
        if sql.check_data_exists("users", "email", createAccount.email):
            return {"message": "Email already exists.", "success": False}
        sql.insert_data(
            "users",
            USER_COLUMNS,
            [id, createAccount.name, createAccount.email, createAccount.password],
        )
        res = sql.get_data("users", USER_COLUMNS)
        print(f"results after createAccount: {res}")
        return {"message": "Account created successfully.", "success": True}
    finally:
        sql.close()


def ensure_bucket_table(sql: sql_py.SQL) -> None:
    sql.create_table("user_buckets", USER_BUCKET_TABLE_COLUMNS)
    if "created_at" not in sql.get_table_columns("user_buckets"):
        sql.add_column("user_buckets", "created_at", "TEXT NOT NULL DEFAULT ''")
    sql.create_index("idx_user_buckets_user_uuid", "user_buckets", ["user_uuid"])


def build_bucket_name(user_uuid: str, existing_bucket_count: int) -> str:
    # MinIO bucket names must be DNS-compatible, so use lowercase and hyphens only.
    safe_user_uuid = user_uuid.lower()
    return f"user-{safe_user_uuid[:12]}-bucket-{existing_bucket_count}"


def get_current_bucket_date() -> str:
    return datetime.now().strftime("%B %d, %Y")


def normalize_bucket_name(bucket_name: str) -> str:
    normalized_bucket_name = bucket_name.strip().lower()
    if not BUCKET_NAME_PATTERN.fullmatch(normalized_bucket_name):
        raise ValueError(
            "Bucket names must be 3-63 characters and use lowercase letters, "
            "numbers, or hyphens only."
        )
    return normalized_bucket_name


def get_user_bucket_names(sql: sql_py.SQL, user_uuid: str) -> list[str]:
    bucket_rows = sql.get_rows("user_buckets", ["bucket_name"], "user_uuid", user_uuid)
    return [row[0] for row in bucket_rows]


def get_user_bucket_records(sql: sql_py.SQL, user_uuid: str) -> list[dict[str, str]]:
    bucket_rows = sql.get_rows(
        "user_buckets",
        ["bucket_name", "created_at"],
        "user_uuid",
        user_uuid,
    )
    return [
        {
            "name": row[0],
            "created_at": row[1] or get_current_bucket_date(),
        }
        for row in bucket_rows
    ]


# def copy_bucket_objects(source_bucket_name: str, destination_bucket_name: str) -> list[str]:
#     copied_object_names: list[str] = []
#     objects = minio_client.list_objects(source_bucket_name, recursive=True)
#     for obj in objects:
#         minio_client.copy_object(
#             bucket_name=destination_bucket_name,
#             object_name=obj.object_name,
#             source=SourceObject(
#                 bucket_name=source_bucket_name,
#                 object_name=obj.object_name,
#             ),
#         )
#         copied_object_names.append(obj.object_name)
#     return copied_object_names


# def remove_bucket_objects(bucket_name: str) -> None:
#     objects = list(minio_client.list_objects(bucket_name, recursive=True))
#     for obj in objects:
#         minio_client.remove_object(bucket_name=bucket_name, object_name=obj.object_name)


# def cleanup_bucket(bucket_name: str) -> None:
#     if not minio_client.bucket_exists(bucket_name):
#         return
#     remove_bucket_objects(bucket_name)
#     minio_client.remove_bucket(bucket_name)


class CreateBucket(BaseModel):
    email: str


@app.post("/create-bucket", tags=["create-bucket"])
async def CreateBucketAPI(createBucket: CreateBucket) -> dict:
    sql = sql_py.SQL()
    try:
        if not sql.check_if_table_exists("users"):
            print("users table doesn't exist")
            return {"message": "Users table doesn't exist.", "success": False}

        user = sql.get_data("users", USER_COLUMNS, "email", createBucket.email)
        if user is None:
            return {"message": "User does not exist.", "success": False}

        user_uuid = user[0]
        ensure_bucket_table(sql)

        existing_buckets = sql.get_rows(
            "user_buckets",
            ["bucket_name"],
            "user_uuid",
            user_uuid,
        )
        bucket_sequence = len(existing_buckets) + 1
        bucket_name = build_bucket_name(user_uuid, bucket_sequence)
        while sql.check_data_exists("user_buckets", "bucket_name", bucket_name):
            bucket_sequence += 1
            bucket_name = build_bucket_name(user_uuid, bucket_sequence)
        created_at = get_current_bucket_date()

        # minio_client.make_bucket(bucket_name)
        sql.insert_data(
            "user_buckets",
            USER_BUCKET_COLUMNS,
            [user_uuid, bucket_name, created_at],
        )
        print(f"bucket created successfully: {bucket_name}")
        return {
            "message": "Bucket created successfully.",
            "success": True,
            "bucket_name": bucket_name,
            "created_at": created_at,
            "user_uuid": user_uuid,
        }
    finally:
        sql.close()


@app.get("/get-user-buckets", tags=["get-user-buckets"])
async def GetUserBuckets(email: str) -> dict:
    
    sql = sql_py.SQL()
    try:
        if not sql.check_if_table_exists("users"):
            return {"message": "Users table doesn't exist.", "success": False, "buckets": []}
        if not sql.check_if_table_exists("user_buckets"):
            return {"message": "No buckets found for user.", "success": True, "buckets": []}

        user = sql.get_data("users", USER_COLUMNS, "email", email)
        if user is None:
            return {"message": "User does not exist.", "success": False, "buckets": []}

        bucket_records = get_user_bucket_records(sql, user[0])
        return {
            "message": "Buckets fetched successfully.",
            "success": True,
            "buckets": bucket_records,
        }
    finally:
        sql.close()

class RenameBucket(BaseModel):
    email: str
    current_bucket_name: str
    new_bucket_name: str

@app.post("/rename-bucket", tags=["rename-bucket"])
async def RenameBucketAPI(renameBucket: RenameBucket) -> dict:
    sql = sql_py.SQL()
    new_bucket_name = ""
    try:
        if not sql.check_if_table_exists("users"):
            return {"message": "Users table doesn't exist.", "success": False}
        if not sql.check_if_table_exists("user_buckets"):
            return {"message": "No buckets found for user.", "success": False}

        user = sql.get_data("users", USER_COLUMNS, "email", renameBucket.email)
        if user is None:
            return {"message": "User does not exist.", "success": False}

        current_bucket_name = renameBucket.current_bucket_name.strip()
        new_bucket_name = normalize_bucket_name(renameBucket.new_bucket_name)

        if current_bucket_name == new_bucket_name:
            return {
                "message": "New bucket name must be different from the current name.",
                "success": False,
            }

        bucket_names = get_user_bucket_names(sql, user[0])
        if current_bucket_name not in bucket_names:
            return {
                "message": "Bucket does not belong to the current user.",
                "success": False,
            }
            
        

        # if sql.check_data_exists("user_buckets", "bucket_name", new_bucket_name):
        #     return {"message": "Bucket name already exists.", "success": False}

        # if not minio_client.bucket_exists(current_bucket_name):
        #     return {
        #         "message": "Current bucket does not exist in storage.",
        #         "success": False,
        #     }
        # if minio_client.bucket_exists(new_bucket_name):
        #     return {"message": "Bucket name already exists in storage.", "success": False}

        # minio_client.make_bucket(new_bucket_name)
        # created_new_bucket = True
        # copy_bucket_objects(current_bucket_name, new_bucket_name)
        # remove_bucket_objects(current_bucket_name)
        # minio_client.remove_bucket(current_bucket_name)

        sql.update_data(
            "user_buckets",
            ["bucket_name"],
            [new_bucket_name],
            ["user_uuid", "bucket_name"],
            [user[0], current_bucket_name],
        )

        return {
            "message": "Bucket renamed successfully.",
            "success": True,
            "bucket_name": new_bucket_name,
            "previous_bucket_name": current_bucket_name,
            "user_uuid": user[0],
        }
    except ValueError as exc:
        return {"message": str(exc), "success": False}
    # except Exception as exc:
    #     if created_new_bucket and new_bucket_name:
    #         try:
    #             cleanup_bucket(new_bucket_name)
    #         except Exception as cleanup_error:
    #             print(
    #                 "Failed to clean up renamed bucket",
    #                 new_bucket_name,
    #                 cleanup_error,
    #             )
    #     print(f"Error renaming bucket: {exc}")
    #     return {"message": f"Failed to rename bucket: {exc}", "success": False}
    finally:
        sql.close()
        
    
class DeleteBucket(BaseModel):
    email: str
    current_bucket_name: str

    
@app.post("/delete-bucket", tags=["delete-bucket"])
async def DeleteBucketAPi(deletebucket: DeleteBucket) -> dict:
    sql = sql_py.SQL()

    print(f"email: {deletebucket.email}")
    print(f"current_bucket_name: {deletebucket.current_bucket_name}")

    try:
        if not sql.check_if_table_exists("users"):
            return {"message": "Users table doesn't exist.", "success": False}
        if not sql.check_if_table_exists("user_buckets"):
            return {"message": "No buckets found for user.", "success": False}

        user = sql.get_data("users", USER_COLUMNS, "email", deletebucket.email)
        if user is None:
            return {"message": "User does not exist.", "success": False}

        current_bucket_name = deletebucket.current_bucket_name.strip()
        bucket_names = get_user_bucket_names(sql, user[0])
        if current_bucket_name not in bucket_names:
            return {
                "message": "Bucket does not belong to the current user.",
                "success": False,
            }

        deleted_rows = sql.delete_bucket("user_buckets", user[0], current_bucket_name)
        if deleted_rows == 0:
            return {"message": "Bucket could not be deleted.", "success": False}

        # if not minio_client.bucket_exists(current_bucket_name):
        #     return {
        #         "message": "Current bucket does not exist in storage.",
        #         "success": False,
        #     }
        # if minio_client.bucket_exists(new_bucket_name):
        #     return {"message": "Bucket name already exists in storage.", "success": False}

        # minio_client.make_bucket(new_bucket_name)
        # created_new_bucket = True
        # copy_bucket_objects(current_bucket_name, new_bucket_name)
        # remove_bucket_objects(current_bucket_name)
        # minio_client.remove_bucket(current_bucket_name)


    except ValueError as exc:
        return {"message": str(exc), "success": False}
    # except Exception as exc:
    #     if created_new_bucket and new_bucket_name:
    #         try:
    #             cleanup_bucket(new_bucket_name)
    #         except Exception as cleanup_error:
    #             print(
    #                 "Failed to clean up renamed bucket",
    #                 new_bucket_name,
    #                 cleanup_error,
    #             )
    #     print(f"Error renaming bucket: {exc}")
    #     return {"message": f"Failed to rename bucket: {exc}", "success": False}
    finally:
        sql.close()

    return {
        "message": "Bucket deleted successfully.",
        "success": True,
        "bucket_name": current_bucket_name,
        "user_uuid": user[0],
    }



# @app.get("/buckets", tags=["buckets"])
# async def GetBuckets() -> dict:
#     buckets = minio_client.list_buckets()
#     return {"message": "Buckets fetched successfully.", "success": True, "buckets": buckets}
