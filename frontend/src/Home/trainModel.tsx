import { trainModel } from "./backend.js";
import data from "./data.json";
import Form from "@rjsf/core";
import validator from "@rjsf/validator-ajv8";
import { useRef } from "react";

import loader from "@monaco-editor/loader";

import Editor from "@monaco-editor/react";

export default function TrainModel() {
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    console.log(file);
    const response = await trainModel(file);
    console.log(response);
  };

  const schema: RJSFSchema = {
    title: "Test form",
    type: "object",
    properties: {
      name: {
        type: "string",
      },
      age: {
        type: "number",
      },
    },
  };
  const editorRef = useRef(null);

  loader.init().then((monaco) => {
    const wrapper = document.getElementById("root");
    wrapper.style.height = "100vh";
    const properties = {
      value: 'function hello() {\n\talert("Hello world!");\n}',
      language: "javascript",
    };

    // monaco.editor.create(wrapper, properties);
  });

  function handleEditorDidMount(editor, monaco) {
    editorRef.current = editor;
  }
  // loader.init().then((monaco) => {
  //   const wrapper = document.getElementById("root");
  //   wrapper.style.height = "100vh";
  //   const properties = {
  //     value: 'function hello() {\n\talert("Hello world!");\n}',
  //     language: "javascript",
  //   };

  //   monaco.editor.create(wrapper, properties);
  // });

  return (
    <div className="flex flex-col h-full w-full  border-l-2 border-r-2 border-gray-200">
      <div className="flex flex-col">
        <div className="flex items-center justify-center">
          <div className="flex flex-col p-10 justify-center w-[80%] ">
            <label
              htmlFor="dropzone-file"
              className="flex flex-col items-center justify-center w-full h-64 border rounded-lg border-default-strong rounded-base cursor-pointer hover:bg-neutral-tertiary-medium"
            >
              <div className="flex flex-col items-center justify-center text-body pt-5 pb-6">
                <svg
                  className="w-8 h-8 mb-4"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke="currentColor"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M15 17h3a3 3 0 0 0 0-6h-.025a5.56 5.56 0 0 0 .025-.5A5.5 5.5 0 0 0 7.207 9.021C7.137 9.017 7.071 9 7 9a4 4 0 1 0 0 8h2.167M12 19v-9m0 0-2 2m2-2 2 2"
                  />
                </svg>
                <p className="mb-2 text-sm">
                  <span className="font-semibold">Click to upload</span> or drag
                  and drop
                </p>
                <p className="text-xs">SVG, PNG, JPG or GIF (MAX. 800x400px)</p>
              </div>
              <input
                id="dropzone-file"
                type="file"
                className="hidden"
                onChange={handleFileChange}
              />
            </label>
            <div className="flex mt-10">
              <h1 className="text-2xl font-bold">Train Model Configuration</h1>
            </div>
            <div className="flex mt-10 flex-col max-w-md">
              <div className="relative">
                <input
                  type="text"
                  id="model_name"
                  className="block px-2.5 pb-2.5 pt-4 w-full text-sm text-heading bg-transparent rounded-base border border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-brand peer"
                  placeholder=" " /* <-- CRITICAL: This space placeholder makes the floating label work */
                />
                <label
                  htmlFor="model_name"
                  className="absolute text-sm text-body duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-[#242424] px-2 peer-focus:px-2 peer-focus:text-brand peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 start-1 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto"
                >
                  Model Name
                </label>
              </div>
              <div className="relative mt-4">
                <input
                  type="text"
                  id="dependencies"
                  className="block px-2.5 pb-2.5 pt-4 w-full text-sm text-heading bg-transparent rounded-base border border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-brand peer"
                  placeholder=" " /* <-- CRITICAL: This space placeholder makes the floating label work */
                />
                <label
                  htmlFor="dependencies"
                  className="absolute text-sm text-body duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-[#242424] px-2 peer-focus:px-2 peer-focus:text-brand peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 start-1 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto"
                >
                  Dependencies
                </label>
              </div>
              <div className="relative mt-4">
                <input
                  type="text"
                  id="pytorch_version"
                  className="block px-2.5 pb-2.5 pt-4 w-full text-sm text-heading bg-transparent rounded-base border border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-brand peer"
                  placeholder=" " /* <-- CRITICAL: This space placeholder makes the floating label work */
                />
                <label
                  htmlFor="pytorch_version"
                  className="absolute text-sm text-body duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-[#242424] px-2 peer-focus:px-2 peer-focus:text-brand peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 start-1 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto"
                >
                  Pytorch Version
                </label>
              </div>
              <Editor
                height="30vh"
                defaultLanguage="json"
                defaultValue={JSON.stringify(data)}
                onMount={handleEditorDidMount}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
