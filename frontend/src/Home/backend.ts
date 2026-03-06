import axios from "axios";
import { v4 as uuidv4 } from "uuid";

type JsonParameters = {
  pytorch_version: number;
  use_cuda: boolean;
  model_name: string;
  dependencies: string;
  hyperparameters: Record<string, unknown>;
};
export const sendJsonPythonFile = async (
  JsonParameters: JsonParameters,
  python_files: File[],
) => {
  const formData = new FormData();

  formData.append("metadata", JSON.stringify(JsonParameters));
  const client_id = uuidv4();
  formData.append("client_id", client_id);
  // Read each file into memory immediately to avoid ERR_UPLOAD_FILE_CHANGED
  // (the browser can lose the file reference if the file changes on disk)
  for (const file of python_files) {
    console.log("file name: ", file.name);
    const buffer = await file.arrayBuffer();
    const blob = new Blob([buffer], { type: file.type || "text/plain" });
    formData.append("python_files", blob, file.name);
  }

  try {
    const response = await axios.post(
      "http://localhost:8000/jsonPythonFile",
      formData,
    );
    return response.data;
  } catch (error) {
    console.error("Error sending JSON and Python file", error);
    return { error: "Error sending JSON and Python file" };
  }
};

export const connectToWebSocket = async () => {
  const ws = new WebSocket("ws://localhost:8000/ws");
  ws.onmessage = (event) => {
    console.log("Received message: ", event.data);
  };
  ws.onopen = () => {
    console.log("WebSocket connected");
  };
};

export const sendJson = async (json: JsonParameters) => {
  try {
    const response = await axios.post(
      "http://localhost:8000/parameters",
      json,
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
    return response.data;
  } catch (error) {
    console.error("Error sending parameters", error);
  }
};

export const sendPythonFile = async (python_files: File[]) => {
  const formData = new FormData();

  for (const file_p of python_files) {
    formData.append("python_files", file_p);
  }
  console.log("formData: ", formData);
  console.log("python_files: ", python_files);
  try {
    const response = await axios.post(
      "http://localhost:8000/pythonFile",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
    return response.data;
  } catch (error) {
    console.error("Error uploading file", error);
    return { error: "Error uploading file" };
  }
};

// export const trainModel = async (file) => {
//   const formData = new FormData();
//   formData.append("json_file", JSON.stringify(file));
//   formData.append("json_file_name", file.model_name);
//   console.log("Uploading file");
//   console.log(file);
//   console.log(file.model_name);
//   try {
//     const response = await axios.post("http://localhost:8000/train", formData, {
//       headers: {
//         "Content-Type": "multipart/form-data",
//       },
//     });
//     return response.data;
//   } catch (error) {
//     alert("Error uploading file");
//     console.error("Error uploading file", error);
//     return { error: "Error uploading file" };
//   }
// };

const valid_model_names = ".pth";
const valid_dependencies = ".txt";

const valid_pytorch_versions = [
  2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9, 2.1,
];

export const validateJson = (json: string) => {
  let reasonSet = "No Fail";
  let parsedJson: JsonParameters;

  try {
    parsedJson = JSON.parse(json) as JsonParameters;
  } catch (error) {
    return { val: false, reason: "Json Parse Error" };
  }

  const all: Record<string, unknown> = {
    "pytorch version": parsedJson.pytorch_version,
    CUDA: parsedJson.use_cuda,
    "model name": parsedJson.model_name,
    "dependencies file": parsedJson.dependencies,
    hyperparameters: parsedJson.hyperparameters,
  };

  console.log("all: ", all);

  if (
    parsedJson.pytorch_version &&
    parsedJson.use_cuda &&
    parsedJson.model_name &&
    parsedJson.dependencies &&
    parsedJson.hyperparameters
  ) {
    console.log("All fields are present");
  } else {
    for (const key in all) {
      if (!all[key]) {
        reasonSet = "Field " + key + " is missing";
        return { val: false, reason: reasonSet };
      }
    }
  }

  if (!valid_pytorch_versions.includes(parsedJson.pytorch_version)) {
    reasonSet = "Pytorch version is invalid";
    return { val: false, reason: reasonSet };
  }
  if (!(parsedJson.use_cuda == true)) {
    reasonSet = "Use CUDA is invalid";
    return { val: false, reason: reasonSet };
  }
  if (!parsedJson.model_name.endsWith(valid_model_names)) {
    reasonSet = "Model name is invalid";
    return { val: false, reason: reasonSet };
  }
  if (!parsedJson.dependencies.endsWith(valid_dependencies)) {
    reasonSet = "Dependencies is invalid";
    return { val: false, reason: reasonSet };
  }
  console.log("reason backend: ", reasonSet);

  return { val: true, reason: reasonSet };
};
