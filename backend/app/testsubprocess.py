import json
import subprocess
UPLOAD_DIR = "/home/aman/Projects/ucm-computing/backend/uploads"
json_data = json.load(open("data.json"))
print(json_data)
print(json_data["hyperparameters"]["epochs"])
print(json_data["hyperparameters"]["learning_rate"])
print(json_data["hyperparameters"]["batch_size"])
print(json_data["hyperparameters"]["num_workers"])
print(json_data["hyperparameters"]["pin_memory"])




subprocess.run([
    "python3", "-m", "venv", ".venv"
])
subprocess.run([
    "source", ".venv/bin/activate"
])
subprocess.run([
    "pip", "install", "-r", "requirements.txt"
])




run = []
run.append("python")
run.append("test.py")
for json_key in json_data["hyperparameters"]:
    run.append(f"--{json_key}")
    if isinstance(json_data["hyperparameters"][json_key], int):
        run.append(str(json_data["hyperparameters"][json_key]))
    elif isinstance(json_data["hyperparameters"][json_key], float):
        run.append(str(json_data["hyperparameters"][json_key]))
    elif isinstance(json_data["hyperparameters"][json_key], bool):
        run.append(str(json_data["hyperparameters"][json_key]).lower())
    else:
        print(f"type of {json_key} is {type(json_data['hyperparameters'][json_key])}")
        run.append(json_data["hyperparameters"][json_key])
print(run)



subprocess.run(
    run
)

