import axios from "axios";

type JsonParameters = {
  pytorch_version: number;
  use_cuda: boolean;
  model_name: string;
  dependencies: string;
  hyperparameters: any;
};
export const sendJsonPythonFile = async (
  JsonParameters: JsonParameters,
  python_files: File[],
) => {
  // const jsonString = JSON.stringify(JsonParameters);

  const formData = new FormData();

  formData.append("metadata", JSON.stringify(JsonParameters));
  for (const file of python_files) {
    console.log("file name: ", file.name);

    formData.append("python_files", file, file.name);
  }
  console.log("python_files: ", python_files);
  // console.log("jsonString: ", jsonString);
  try {
    const response = await axios.post(
      "http://localhost:8000/jsonPythonFile",
      formData,
    );
    return response.data;
  } catch (error) {
    console.error("Error sending JSON and Python file", error);
  }
};

export const sendJson = async (json) => {
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

export const sendPythonFile = async (python_files) => {
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

export const validateJson = (json) => {
  let reasonSet = "No Fail";

  try {
    json = JSON.parse(json);
  } catch (error) {
    return { val: false, reason: "Json Parse Error" };
  }

  let all = {
    "pytorch version": json.pytorch_version,
    CUDA: json.use_cuda,
    "model name": json.model_name,
    "dependencies file": json.dependencies,
    hyperparameters: json.hyperparameters,
  };

  console.log("all: ", all);

  if (
    json.pytorch_version &&
    json.use_cuda &&
    json.model_name &&
    json.dependencies &&
    json.hyperparameters
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

  if (!valid_pytorch_versions.includes(json.pytorch_version)) {
    reason = "Pytorch version is invalid";
    return { val: false, reason: reasonSet };
  }
  if (!(json.use_cuda == true)) {
    reason = "Use CUDA is invalid";
    return { val: false, reason: reasonSet };
  }
  if (!json.model_name.endsWith(valid_model_names)) {
    reason = "Model name is invalid";
    return { val: false, reason: reasonSet };
  }
  if (!json.dependencies.endsWith(valid_dependencies)) {
    reason = "Dependencies is invalid";
    return { val: false, reason: reasonSet };
  }
  console.log("reason backend: ", reasonSet);

  return { val: true, reason: reasonSet };
};
