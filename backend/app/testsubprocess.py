import json
import os
import re
import shutil
import subprocess
import uuid
from pathlib import Path
from typing import TypedDict


UPLOAD_DIR = os.getenv("UPLOAD_DIR") or "/Users/amannindra/Projects/ucm-computing/backend/train"
print(f"UPLOAD_DIR: {UPLOAD_DIR}")
DOCKER_BASE_IMAGE = os.getenv(
    "TRAINING_DOCKER_BASE_IMAGE",
    "pytorch/pytorch:2.4.1-cuda12.1-cudnn9-runtime",
)
print(f"DOCKER_BASE_IMAGE: {DOCKER_BASE_IMAGE}")

CPU_BASE_IMAGE = "python:3.11-slim"


class UploadedTrainingFile(TypedDict):
    filename: str
    content: bytes


def delete_uuid_folder(user_uuid: str):
    uuid_folder = os.path.join(UPLOAD_DIR, user_uuid)
    shutil.rmtree(uuid_folder, ignore_errors=True)


def normalize_filename(filename: str) -> str:
    normalized_name = os.path.basename(filename)
    if not normalized_name or normalized_name in {".", ".."}:
        raise ValueError(f"Invalid filename received: {filename!r}")
    return normalized_name


def create_job_directories(user_uuid: str) -> tuple[str, str, str]:
    uuid_folder = os.path.join(UPLOAD_DIR, user_uuid)
    src_folder = os.path.join(uuid_folder, "src")
    artifacts_folder = os.path.join(uuid_folder, "artifacts")
    os.makedirs(src_folder, exist_ok=True)
    os.makedirs(artifacts_folder, exist_ok=True)
    return uuid_folder, src_folder, artifacts_folder


def save_metadata(uuid_folder: str, metadata: str) -> None:
    metadata_path = Path(uuid_folder) / "metadata.json"
    metadata_path.write_text(metadata, encoding="utf-8")


def save_python_files(
    src_folder: str,
    python_files: list[UploadedTrainingFile],
) -> set[str]:
    uploaded_names: set[str] = set()

    for file in python_files:
        filename = normalize_filename(file["filename"])
        file_path = Path(src_folder) / filename
        file_path.write_bytes(file["content"])
        uploaded_names.add(filename)

    return uploaded_names


def validate_uploaded_inputs(
    json_data: dict,
    uploaded_names: set[str],
) -> tuple[str, str]:
    raw_python_main = str(json_data["python_main"])
    raw_dependencies = str(json_data["dependencies"])
    python_main = normalize_filename(raw_python_main)
    dependencies = normalize_filename(raw_dependencies)
    print(f"Before python_main: {raw_python_main}, after: {python_main}")
    print(f"Before dependencies: {raw_dependencies}, after: {dependencies}")
    missing_files = [
        filename
        for filename in (python_main, dependencies)
        if filename not in uploaded_names
    ]
    print(f"missing_files: {missing_files}")
    if missing_files:
        raise ValueError(
            "The following metadata files were not uploaded: "
            + ", ".join(missing_files)
        )
    return python_main, dependencies


def write_dockerfile(uuid_folder: str, python_main: str, dependencies: str) -> None:
    dockerfile_contents = f"""FROM {DOCKER_BASE_IMAGE}
WORKDIR /workspace/artifacts
COPY src/ /workspace/src/
RUN python -m pip install --upgrade pip && \\
    python -m pip install --no-cache-dir -r /workspace/src/{dependencies} \\
    --trusted-host pypi.org --trusted-host files.pythonhosted.org
ENTRYPOINT ["python", "/workspace/src/{python_main}"]
"""
    (Path(uuid_folder) / "Dockerfile").write_text(dockerfile_contents, encoding="utf-8")

def write_dockerfile_no_cuda(uuid_folder: str, python_main: str, dependencies: str) -> None:
    dockerfile_contents = f"""FROM {CPU_BASE_IMAGE}
WORKDIR /workspace/artifacts
COPY src/ /workspace/src/
RUN python -m pip install --upgrade pip && \\
    python -m pip install --no-cache-dir -r /workspace/src/{dependencies} \\
    --trusted-host pypi.org --trusted-host files.pythonhosted.org
ENTRYPOINT ["python", "/workspace/src/{python_main}"]
"""
    (Path(uuid_folder) / "Dockerfile").write_text(dockerfile_contents, encoding="utf-8")

def write_dockerignore(uuid_folder: str) -> None:
    dockerignore_contents = """__pycache__/
*.pyc
artifacts/
"""
    (Path(uuid_folder) / ".dockerignore").write_text(
        dockerignore_contents,
        encoding="utf-8",
    )


def build_image_tag(user_uuid: str) -> str:
    safe_user_uuid = re.sub(r"[^a-z0-9_.-]+", "-", user_uuid.lower()).strip("-.")
    if not safe_user_uuid:
        safe_user_uuid = "user"
    return f"ucm-training:{safe_user_uuid}-{uuid.uuid4().hex[:8]}"


def build_training_arguments(json_data: dict) -> list[str]:
    model_output = os.path.join(
        "/workspace/artifacts",
        os.path.basename(str(json_data["model_name"])),
    )

    run = ["--use_cuda", str(json_data["use_cuda"]).lower()]
    run += ["--model_name", model_output]

    for key, val in json_data["hyperparameters"].items():
        run.append(f"--{key}")
        if isinstance(val, bool):
            print(f"val: {val} is bool: {str(val).lower()}")
            run.append(str(val).lower())
        elif isinstance(val, (int, float)):
            print(f"val: {val} is int or float")
            run.append(str(val))
        else:
            run.append(str(val))

    print(f"run: {run}")
    
    
    return run


def run_command(user_uuid: str, metadata: str, python_files: list[UploadedTrainingFile]):
    print("Running command for user: ", user_uuid)

    if user_uuid == "undefined":
        print("User UUID is undefined")
        return False
    if not UPLOAD_DIR:
        print("UPLOAD_DIR is not configured")
        return False


    try:
        delete_uuid_folder(user_uuid)
        uuid_folder, src_folder, artifacts_folder = create_job_directories(user_uuid)
        print("Created job directories: ")
        print(f"uuid_folder: {uuid_folder}")
        print(f"src_folder: {src_folder}")
        print(f"artifacts_folder: {artifacts_folder}")
        
        save_metadata(uuid_folder, metadata)
        print("start-------------------------------------")

        json_data = json.loads(metadata)
        print(f"parameters: {json_data}")
        # print(f"Type of parameters: {type(json_data)}")
        # print(f"python main: {json_data['python_main']}")
        # print(f"dependencies: {json_data['dependencies']}")

        uploaded_names = save_python_files(src_folder, python_files)
        print("save_python_files: ")
        print(f"uploaded_names: {uploaded_names}")
        python_main, dependencies = validate_uploaded_inputs(json_data, uploaded_names)
        print("validate_uploaded_inputs: ")
        print(f"python_main: {python_main}")
        print(f"dependencies: {dependencies}")
        use_cuda = str(json_data.get("use_cuda", False)).lower() == "true"
        if use_cuda:
            write_dockerfile(uuid_folder, python_main, dependencies)
        else:
            write_dockerfile_no_cuda(uuid_folder, python_main, dependencies)
        write_dockerignore(uuid_folder)

        image_tag = build_image_tag(user_uuid)
        print(f"image_tag: {image_tag}")
        build_command = ["docker", "build", "-t", image_tag, uuid_folder]
        print(f"Building Docker image with command: {build_command}")
        subprocess.run(build_command, check=True)
        

        run_args = build_training_arguments(json_data)
        docker_run_command = ["docker", "run", "--rm"]
        if use_cuda:
            docker_run_command += ["--gpus", "all"]
        docker_run_command += [
            "-v",
            f"{artifacts_folder}:/workspace/artifacts",
            image_tag,
            *run_args,
        ]
        print(f"Running Docker container with command: {docker_run_command}")
        subprocess.run(docker_run_command, check=True)

        print("Model training completed")
        return True
    except subprocess.CalledProcessError as exc:
        print(f"Docker command failed with exit code {exc.returncode}: {exc.cmd}")
        return False
    except Exception as exc:
        print(f"Training setup failed: {exc}")
        return False


def load_local_training_files(source_dir: Path) -> list[UploadedTrainingFile]:
    training_files: list[UploadedTrainingFile] = []
    for file_path in sorted(source_dir.iterdir()):
        if file_path.is_file():
            training_files.append(
                {
                    "filename": file_path.name,
                    "content": file_path.read_bytes(),
                }
            )
    return training_files


if __name__ == "__main__":
    local_source_dir = Path(__file__).parent / "mac_testing"
    local_metadata = {
        "python_main": "test.py",
        "pytorch_version": 2.4,
        "use_cuda": False,
        "model_name": "model.pth",
        "dependencies": "requirements.txt",
        "hyperparameters": {
            "epochs": 1,
            "learning_rate": 0.001,
            "batch_size": 128,
            "num_workers": 2,
            "pin_memory": False,
        },
    }
    local_python_files = load_local_training_files(local_source_dir)
    run_command(
        "mac-local-test",
        json.dumps(local_metadata),
        local_python_files,
    )