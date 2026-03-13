import { validateJson, sendJsonPythonFile } from "./backend";
import data from "./data.json";
import { useRef, useState } from "react";
import Editor from "@monaco-editor/react";
import Terminal, { ColorMode, TerminalOutput } from "react-terminal-ui";
import { connectToWebSocket } from "./backend";

type User = {
  uuid: string;
  name: string;
  email: string;
  password: string;
};
export default function TrainModel({ user }: { user: User | null }) {
  type EditorInstance = {
    getValue: () => string;
  };

  type ValidationResult = {
    val: boolean;
    reason: string;
  };

  type TerminalLine = {
    id: number;
    text: string;
  };

  const initialTerminalMessage =
    'Ready. Upload Python files and click "Train Model" to start.';

  const editorRef = useRef<EditorInstance | null>(null);
  const [validatedJson, setValidatedJson] = useState<boolean>(true);
  const [reasonVisible, setReasonVisible] = useState<string>("Json is valid");
  const [file_names, setFileNames] = useState<string[]>([]);
  const [python_file, setPythonFile] = useState<File[]>([]);
  const [terminalLines, setTerminalLines] = useState<TerminalLine[]>([
    { id: 0, text: initialTerminalMessage },
  ]);

  const appendTerminalLines = (lines: string[]) => {
    setTerminalLines((current) => {
      const lastId = current.length > 0 ? current[current.length - 1].id : -1;
      return [
        ...current,
        ...lines.map((text, index) => ({
          id: lastId + index + 1,
          text,
        })),
      ];
    });
  };

  const appendTerminalLine = (text: string) => {
    appendTerminalLines([text]);
  };

  const resetTerminal = () => {
    setTerminalLines([{ id: 0, text: initialTerminalMessage }]);
  };

  const writeResponseToTerminal = (response: unknown) => {
    if (!response) {
      return;
    }

    if (typeof response === "string") {
      appendTerminalLine(`server> ${response}`);
      return;
    }

    if (typeof response === "object") {
      const responseLines = JSON.stringify(response, null, 2)
        .split("\n")
        .map((line) => `server> ${line}`);
      appendTerminalLines(responseLines);
    }
  };

  const validateJsonSimple = (): ValidationResult => {
    if (!editorRef.current) {
      const reason = "Editor is not ready yet";
      setReasonVisible(reason);
      setValidatedJson(false);
      return { val: false, reason };
    }

    const { val, reason }: ValidationResult = validateJson(
      editorRef.current.getValue(),
    );

    if (!val) {
      setReasonVisible(reason);
      setValidatedJson(false);
      return { val, reason };
    }

    setValidatedJson(true);
    setReasonVisible("Json is valid");
    return { val: true, reason: "Json is valid" };
  };

  function handleEditorChange(value: string | undefined) {
    if (!value) {
      setValidatedJson(false);
      setReasonVisible("Json Parse Error");
      return;
    }

    const { val, reason } = validateJson(value);
    if (val) {
      setValidatedJson(true);
      setReasonVisible("Json is valid");
    } else {
      setValidatedJson(false);
      setReasonVisible(reason);
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileNames((current) => [...current, file.name]);
      setPythonFile((current) => [...current, file]);
      appendTerminalLine(`Attached file: ${file.name}`);
    } else {
      console.log("No file selected");
    }
  };

  const handleTrainModel = async () => {
    appendTerminalLine("$ train-model");
    appendTerminalLine("Checking training configuration...");

    const validation = validateJsonSimple();
    if (!validation.val) {
      appendTerminalLine(`Validation failed: ${validation.reason}`);
      return;
    }

    if (!editorRef.current) {
      appendTerminalLine("Training cancelled: editor is unavailable.");
      return;
    }

    if (python_file.length === 0) {
      appendTerminalLine(
        "Training cancelled: upload at least one Python file.",
      );
      return;
    }

    appendTerminalLine("Configuration valid.");
    appendTerminalLine(`Preparing ${python_file.length} file(s) for upload...`);
    appendTerminalLine(
      "Sending request to backend at http://localhost:8000...",
    );

    if (!user?.uuid) {
      console.log("user.uuid is not set");
      console.log("user: ", user);
      appendTerminalLine("Training cancelled: user UUID is not set.");
      return;
    }
    console.log("user.uuid: ", user.uuid);
    const response = await sendJsonPythonFile(
      JSON.parse(editorRef.current.getValue()),
      python_file,
      user.uuid,
    );

    if (!response || response.error) {
      appendTerminalLine(
        `Training request failed: ${response?.error ?? "Unknown error"}`,
      );
      return;
    }

    appendTerminalLine("Training request accepted.");
    writeResponseToTerminal(response);
  };

  function handleEditorWillMount(monaco: any) {
    monaco.editor.defineTheme("customDarkTheme", {
      base: "vs-dark", // Inherit standard dark mode colors
      inherit: true,
      rules: [],
      colors: {
        "editor.background": "#242424", // Your custom background
      },
    });
  }

  function handleEditorDidMount(editor: EditorInstance) {
    editorRef.current = editor;
  }

  const handleDeleteFile = (file_name: string) => {
    setFileNames((current) => current.filter((name) => name !== file_name));
    setPythonFile((current) =>
      current.filter((file) => file.name !== file_name),
    );
    appendTerminalLine(`Removed file: ${file_name}`);
  };

  const GridFile = (file_name: string, index: number) => {
    return (
      <div
        className="flex items-center justify-center border border-gray-600 rounded-md p-2 max-w-[200px]"
        key={index}
      >
        <p className="text-sm text-gray-300 truncate w-full text-center">
          {file_name}
        </p>
        <button
          className="ml-2 text-sm text-gray-300 hover:text-white"
          onClick={() => handleDeleteFile(file_name)}
        >
          X
        </button>
      </div>
    );
  };

  connectToWebSocket();

  return (
    <div className="flex flex-col h-full w-full border-l-2 border-r-2 border-gray-200 overflow-y-auto">
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
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15 17h3a3 3 0 0 0 0-6h-.025a5.56 5.56 0 0 0 .025-.5A5.5 5.5 0 0 0 7.207 9.021C7.137 9.017 7.071 9 7 9a4 4 0 1 0 0 8h2.167M12 19v-9m0 0-2 2m2-2 2 2"
                  />
                </svg>
                <p className="mb-2 text-sm">
                  <span className="font-semibold">Click to upload</span> or drag
                  and drop
                </p>
                <p className="text-xs">Python file(.py)</p>
              </div>
              <input
                id="dropzone-file"
                type="file"
                accept=".py, .txt"
                className="hidden"
                onChange={handleFileChange}
              />
            </label>
            {/* {validatedPython && python_file.length > 0 && (
              <div className="text-green-500">{pythonVisible}</div>
            )}
            {!validatedPython && python_file.length > 0 && (
              <div className="text-red-500">{pythonVisible}</div>
            )} */}
            {file_names.length > 0 && (
              <div className="flex flex-row flex-wrap gap-2 mt-4 w-full overflow-hidden">
                {file_names.map((file_name, index) =>
                  GridFile(file_name, index),
                )}
              </div>
            )}
            {/* <button
              className=" mt-2 border-2 border-white text-white px-4 py-2 rounded-md hover:bg-gray-200 hover:text-black"
              onClick={() => handleUploadPythonFile()}
            >
              Upload Python File
            </button> */}

            <div className="flex mt-10">
              <h1 className="text-3xl font-bold">Train Model Configuration</h1>
            </div>
            <div className="">
              <h2 className="text-2xl font-bold mt-3">Documentations</h2>
              <p className="text-sm text-gray-300 mt-2">
                In order to train the model, you need to provide the following
                information:
              </p>
            </div>
            <div className="flex flex-col ">
              <div className="mt-8 border border-gray-600 rounded-md overflow-hidden">
                <Editor
                  height="400px"
                  language="json"
                  theme="customDarkTheme"
                  value={JSON.stringify(data, null, 2)}
                  beforeMount={handleEditorWillMount}
                  onMount={handleEditorDidMount}
                  onChange={handleEditorChange}
                  options={{
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    padding: { top: 16, bottom: 16 },
                    scrollbar: {
                      vertical: "auto",
                      horizontal: "auto",
                    },
                    // Add these to make the text bigger:
                    fontSize: 18, // Increase font size (default is usually 12-14)
                    lineHeight: 28, // Optional: Increase line height for better readability
                    fontWeight: "500", // Optional: Make the font slightly bolder ("normal", "bold", etc.)
                  }}
                />
              </div>
              {validatedJson && (
                <div className="text-green-500">{reasonVisible}</div>
              )}
              {!validatedJson && (
                <div className="text-red-500">{reasonVisible}</div>
              )}
              <button
                className=" mt-2 border-2 border-white text-white px-4 py-2 rounded-md hover:bg-gray-200 hover:text-black"
                onClick={() => handleTrainModel()}
              >
                Train Model
              </button>
              <div className="mt-4 overflow-hidden rounded-md border border-gray-600">
                <Terminal
                  name="Training Console"
                  height="260px"
                  colorMode={ColorMode.Dark}
                  prompt=">"
                  redBtnCallback={resetTerminal}
                >
                  {terminalLines.map((line) => (
                    <TerminalOutput key={line.id}>{line.text}</TerminalOutput>
                  ))}
                </Terminal>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

//  <div className="relative">
//                 <input
//                   type="text"
//                   id="model_name"
//                   className="block px-2.5 pb-2.5 pt-4 w-full text-sm text-heading bg-transparent rounded-base border border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-brand peer"
//                   placeholder=" " /* <-- CRITICAL: This space placeholder makes the floating label work */
//                 />
//                 <label
//                   htmlFor="model_name"
//                   className="absolute text-sm text-body duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-[#242424] px-2 peer-focus:px-2 peer-focus:text-brand peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 start-1 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto"
//                 >
//                   Model Name
//                 </label>
//               </div>
//               <div className="relative mt-4">
//                 <input
//                   type="text"
//                   id="dependencies"
//                   className="block px-2.5 pb-2.5 pt-4 w-full text-sm text-heading bg-transparent rounded-base border border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-brand peer"
//                   placeholder=" " /* <-- CRITICAL: This space placeholder makes the floating label work */
//                 />
//                 <label
//                   htmlFor="dependencies"
//                   className="absolute text-sm text-body duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-[#242424] px-2 peer-focus:px-2 peer-focus:text-brand peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 start-1 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto"
//                 >
//                   Dependencies
//                 </label>
//               </div>
//               <div className="relative mt-4">
//                 <input
//                   type="text"
//                   id="pytorch_version"
//                   className="block px-2.5 pb-2.5 pt-4 w-full text-sm text-heading bg-transparent rounded-base border border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-brand peer"
//                   placeholder=" " /* <-- CRITICAL: This space placeholder makes the floating label work */
//                 />
//                 <label
//                   htmlFor="pytorch_version"
//                   className="absolute text-sm text-body duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-[#242424] px-2 peer-focus:px-2 peer-focus:text-brand peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 start-1 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto"
//                 >
//                   Pytorch Version
//                 </label>
//               </div>
