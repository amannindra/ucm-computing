import json
import subprocess
import os
from dotenv import load_dotenv
load_dotenv()


UPLOAD_DIR = os.getenv("UPLOAD_DIR")
print(f"UPLOAD_DIR: {UPLOAD_DIR}")


def get_paramaters():
    json_file = os.path.join(UPLOAD_DIR, "parameters.json")
    with open(json_file, "r") as f:
        return json.load(f)


def run_command():
    subprocess.run(["rm", "-rf", ".venv"], cwd=UPLOAD_DIR)

    print("Creating virtual environment")
    subprocess.run(["python3", "-m", "venv", ".venv"], cwd=UPLOAD_DIR)
    subprocess.run(["python3", "-m", "pip", "install", "-upgrade", "pip"], cwd=UPLOAD_DIR)
    json_data = get_paramaters()
    print(f"parameters: {json_data}")
    print(f"python main: {json_data['python_main']}")
    print(f"dependencies: {json_data['dependencies']}")

    subprocess.run(
        [".venv/bin/pip", "install", "-r", json_data["dependencies"],
         "--trusted-host", "pypi.org", "--trusted-host", "files.pythonhosted.org"],
        cwd=UPLOAD_DIR
    )


    run = [".venv/bin/python", "test.py"]
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

    print(f"Running: {run}")
    subprocess.run(run, cwd=UPLOAD_DIR)
    print("Model training completed")

    return True
