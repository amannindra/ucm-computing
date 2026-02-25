import csv
import json
import subprocess
UPLOAD_DIR = "/Users/amannindra/Projects/ucmCompute/backend/train"
import os
# json_data = json.load(open("data.json"))
# print(json_data)
# print(json_data["hyperparameters"]["epochs"])
# print(json_data["hyperparameters"]["learning_rate"])
# print(json_data["hyperparameters"]["batch_size"])
# print(json_data["hyperparameters"]["num_workers"])
# print(json_data["hyperparameters"]["pin_memory"])


# json_file = os.path.join(UPLOAD_DIR, "parameters.json")
# print(json_file)
# with open(json_file, "r") as f:
#     json_data = json.load(f)
# print(json_data)

def get_paramaters():
    json_file = os.path.join(UPLOAD_DIR, "parameters.json")
    with open(json_file, "r") as f:
        raw = json.load(f)
        data = json.loads(raw)
        
    
    return data



def run_command():
    
    subprocess.run([
        "rm", "-rf", ".venv"
    ], cwd=UPLOAD_DIR)
    
    
    subprocess.run([
    "python3", "-m", "venv", ".venv"
    ], cwd=UPLOAD_DIR)
    
    json_data = get_paramaters()
    print(json_data)
    print("type", type(json_data))
    print("dsadsad", json_data["dependencies"] )
    print("--------------------------------")
    subprocess.run([f".venv/bin/pip", "install", "-r", json_data["dependencies"], "--trusted-host", "pypi.org",
    "--trusted-host", "files.pythonhosted.org"], cwd=UPLOAD_DIR)
    run = []
    run.append(f".venv/bin/python")
    run.append("main.py")
    
    run.append("--use_cuda")
    run.append(str(json_data["use_cuda"]).lower())
    run.append("--model_name")
    run.append(json_data["model_name"])
    for key in json_data["hyperparameters"]:
        run.append(f"--{key}")
        if isinstance(json_data["hyperparameters"][key], int):
            run.append(str(json_data["hyperparameters"][key]))
        elif isinstance(json_data["hyperparameters"][key], float):
            run.append(str(json_data["hyperparameters"][key]))
        elif isinstance(json_data["hyperparameters"][key], bool):
            run.append(str(json_data["hyperparameters"][key]).lower())
        else:
            run.append(json_data["hyperparameters"][key])
    print(run)
    subprocess.run(run, cwd=UPLOAD_DIR)
    
    
    # subprocess.run([f"{UPLOAD_DIR}/.venv/bin/python", "main.py"], cwd=UPLOAD_DIR)
    # subprocess.run([
    #     "rm", "-rf", ".venv"
    # ], cwd=UPLOAD_DIR)
    
    return True

run_command()
    

# subprocess.run([
#     "python3", "-m", "venv", ".venv"
# ], cwd=UPLOAD_DIR)

# subprocess.run([f"{UPLOAD_DIR}/.venv/bin/pip", "install", "-r", "requirements.txt"], cwd=UPLOAD_DIR)
# subprocess.run([f"{UPLOAD_DIR}/.venv/bin/python", "main.py"], cwd=UPLOAD_DIR)
# subprocess.run([
#     "rm", "-rf", ".venv"
# ], cwd=UPLOAD_DIR)



# run = []
# run.append("python")
# run.append("test.py")
# for json_key in json_data["hyperparameters"]:
#     run.append(f"--{json_key}")
#     if isinstance(json_data["hyperparameters"][json_key], int):
#         run.append(str(json_data["hyperparameters"][json_key]))
#     elif isinstance(json_data["hyperparameters"][json_key], float):
#         run.append(str(json_data["hyperparameters"][json_key]))
#     elif isinstance(json_data["hyperparameters"][json_key], bool):
#         run.append(str(json_data["hyperparameters"][json_key]).lower())
#     else:
#         print(f"type of {json_key} is {type(json_data['hyperparameters'][json_key])}")
#         run.append(json_data["hyperparameters"][json_key])
# print(run)



# subprocess.run(
#     run
# )

