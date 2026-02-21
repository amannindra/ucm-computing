import axios from "axios";

export const trainModel = async (file) => {
  const formData = new FormData();
  formData.append("json_file", JSON.stringify(file));
  formData.append("json_file_name", file.model_name);
  console.log("Uploading file");
  console.log(file);
  console.log(file.model_name);
  const response = await axios.post("http://localhost:5000/train", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};
const valid_model_names = ".pth";
const valid_dependencies = ".txt";

const valid_pytorch_versions = [
  2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9, 3.0,
];
export const validateJson = async (json) => {
  let val = true;
  if (!valid_pytorch_versions.includes(json.pytorch_version)) {
    val = false;
    console.log("Pytorch versioversion is invalidn is invalid");
  }
  if (!(json.use_cuda == true)) {
    val = false;
    console.log("Use CUDA is invalid");
  }
  if (!json.model_name.endsWith(valid_model_names)) {
    val = false;
    console.log("Model name is invalid");
  }
  if (!json.dependencies.endsWith(valid_dependencies)) {
    val = false;
    console.log("Dependencies is invalid");
  }
  return val;
};

