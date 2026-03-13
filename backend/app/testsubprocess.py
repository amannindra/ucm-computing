import json
import subprocess
import os
import shutil
from dotenv import load_dotenv
load_dotenv()


UPLOAD_DIR = os.getenv("UPLOAD_DIR")
# print(f"UPLOAD_DIR: {UPLOAD_DIR}")


# def get_paramaters(json_file: str):
#     with open(json_file, "r") as f:
#         return json.load(f)


def delete_uuid_folder(user_uuid: str):
    uuid_folder = os.path.join(UPLOAD_DIR, user_uuid)
    shutil.rmtree(uuid_folder, ignore_errors=True)

def upload_python_files(user_uuid: str, python_files: list[UploadFile]):
    uuid_folder = os.path.join(UPLOAD_DIR, user_uuid)
    for file in python_files:
        file_path = os.path.join(uuid_folder, file.filename)
        with open(file_path, "wb") as f:
            f.write(await file.read())

def run_command(user_uuid: str, metadata: str, python_files: list[UploadFile]):
    print("Running command for user: ", user_uuid)
    uuid_folder = os.path.join(UPLOAD_DIR, user_uuid)
    
    if (user_uuid == "undefined"):
        print("User UUID is undefined")
        return
        
    delete_uuid_folder(user_uuid)
    
    if not (os.path.exists(uuid_folder)):
        print("Creating a new Directory: ", uuid_folder)
        os.makedirs(uuid_folder)

    print("Creating virtual environment")
    subprocess.run(["python3", "-m", "venv", ".venv"], cwd=uuid_folder)
    subprocess.run(["python3", "-m", "pip", "install", "-upgrade", "pip"], cwd=uuid_folder)
    json_data = json.loads(metadata)
    # parameters: {"python_main":"main.py","pytorch_version":2.1,"use_cuda":true,"model_name":"model.pth","dependencies":"requirements.txt","hyperparameters":{"epochs":10,"learning_rate":0.001,"batch_size":128,"num_workers":2,"pin_memory":true}}
    
    print(f"parameters: {json_data}")
    print(f"Type of parameters: {type(json_data)}")
    print(f"python main: {json_data['python_main']}")
    print(f"dependencies: {json_data['dependencies']}")

    subprocess.run(
        [".venv/bin/pip", "install", "-r", json_data["dependencies"],
         "--trusted-host", "pypi.org", "--trusted-host", "files.pythonhosted.org"],
        cwd=uuid_folder
    )


    run = [".venv/bin/python", json_data["python_main"]]
    run += ["--use_cuda",   str(json_data["use_cuda"]).lower()]
    run += ["--model_name", json_data["model_name"]]

    for key, val in json_data["hyperparameters"].items():
        run.append(f"--{key}")
        # bool must be checked BEFORE int (bool is a subclass of int in Python)
        if isinstance(val, bool):
            run.append(str(val).lower())
        elif isinstance(val, (int, float)):
            run.append(str(val))
        else:
            run.append(str(val))

    print(f"Running this command: {run}")
    subprocess.run(run, cwd=uuid_folder)
    

    
    print("Model training completed")

    return True
