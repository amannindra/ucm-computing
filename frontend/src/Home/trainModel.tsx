import { validateJson, sendJsonPythonFile, connectToWebSocket } from "./backend";
import data from "./data.json";
import { useEffect, useRef, useState } from "react";
import Editor from "@monaco-editor/react";

type User = {
  uuid: string;
  name: string;
  email: string;
  password: string;
};

type EditorInstance = {
  getValue: () => string;
};

type ValidationResult = {
  val: boolean;
  reason: string;
};

type TerminalTone = "command" | "error" | "info" | "socket" | "success";

type TerminalLine = {
  id: number;
  text: string;
  time: string;
  tone: TerminalTone;
};

const initialTerminalMessage =
  'Ready. Upload Python files and click "Train Model" to start.';

function timestamp() {
  return new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function lineToneClass(tone: TerminalTone) {
  if (tone === "success") {
    return "text-green-400";
  }
  if (tone === "error") {
    return "text-red-400";
  }
  if (tone === "command") {
    return "text-yellow-300";
  }
  if (tone === "socket") {
    return "text-cyan-300";
  }
  return "text-gray-200";
}

export default function TrainModel({ user }: { user: User | null }) {
  const editorRef = useRef<EditorInstance | null>(null);
  const terminalBottomRef = useRef<HTMLDivElement | null>(null);
  const [validatedJson, setValidatedJson] = useState<boolean>(true);
  const [reasonVisible, setReasonVisible] = useState<string>("Json is valid");
  const [fileNames, setFileNames] = useState<string[]>([]);
  const [pythonFiles, setPythonFiles] = useState<File[]>([]);
  const [socketState, setSocketState] = useState("connecting");
  const [terminalLines, setTerminalLines] = useState<TerminalLine[]>([
    { id: 0, text: initialTerminalMessage, time: timestamp(), tone: "info" },
  ]);

  const appendTerminalLine = (text: string, tone: TerminalTone = "info") => {
    setTerminalLines((current) => {
      const nextId = current.length > 0 ? current[current.length - 1].id + 1 : 0;
      return [...current, { id: nextId, text, time: timestamp(), tone }];
    });
  };

  const appendResponseToTerminal = (response: unknown) => {
    if (!response) {
      return;
    }

    if (typeof response === "string") {
      appendTerminalLine(`server> ${response}`, "success");
      return;
    }

    if (typeof response === "object") {
      JSON.stringify(response, null, 2)
        .split("\n")
        .forEach((line) => appendTerminalLine(`server> ${line}`, "success"));
    }
  };

  const resetTerminal = () => {
    setTerminalLines([
      { id: 0, text: initialTerminalMessage, time: timestamp(), tone: "info" },
    ]);
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files ?? []);

    if (selectedFiles.length === 0) {
      return;
    }

    const newFiles = selectedFiles.filter(
      (file) => !pythonFiles.some((existingFile) => existingFile.name === file.name),
    );

    if (newFiles.length === 0) {
      appendTerminalLine("Selected files are already attached.", "info");
      return;
    }

    setFileNames((current) => [...current, ...newFiles.map((file) => file.name)]);
    setPythonFiles((current) => [...current, ...newFiles]);
    newFiles.forEach((file) =>
      appendTerminalLine(`Attached file: ${file.name}`, "info"),
    );
    e.target.value = "";
  };

  const handleTrainModel = async () => {
    appendTerminalLine("$ train-model", "command");
    appendTerminalLine("Checking training configuration...", "info");

    const validation = validateJsonSimple();
    if (!validation.val) {
      appendTerminalLine(`Validation failed: ${validation.reason}`, "error");
      return;
    }

    if (!editorRef.current) {
      appendTerminalLine("Training cancelled: editor is unavailable.", "error");
      return;
    }

    if (pythonFiles.length === 0) {
      appendTerminalLine(
        "Training cancelled: upload at least one Python file.",
        "error",
      );
      return;
    }

    appendTerminalLine("Configuration valid.", "success");
    appendTerminalLine(`Preparing ${pythonFiles.length} file(s) for upload...`, "info");
    appendTerminalLine(
      "Sending request to backend at http://localhost:8000...",
      "info",
    );

    if (!user?.uuid) {
      appendTerminalLine("Training cancelled: user UUID is not set.", "error");
      return;
    }

    const response = await sendJsonPythonFile(
      JSON.parse(editorRef.current.getValue()),
      pythonFiles,
      user.uuid,
    );

    if (!response || response.error) {
      appendTerminalLine(
        `Training request failed: ${response?.error ?? "Unknown error"}`,
        "error",
      );
      return;
    }

    appendTerminalLine("Training request accepted.", "success");
    appendResponseToTerminal(response);
  };

  function handleEditorWillMount(monaco: any) {
    monaco.editor.defineTheme("customDarkTheme", {
      base: "vs-dark",
      inherit: true,
      rules: [],
      colors: {
        "editor.background": "#242424",
      },
    });
  }

  function handleEditorDidMount(editor: EditorInstance) {
    editorRef.current = editor;
  }

  const handleDeleteFile = (fileName: string) => {
    setFileNames((current) => current.filter((name) => name !== fileName));
    setPythonFiles((current) =>
      current.filter((file) => file.name !== fileName),
    );
    appendTerminalLine(`Removed file: ${fileName}`, "info");
  };

  useEffect(() => {
    const disconnect = connectToWebSocket({
      onClose: () => {
        setSocketState("disconnected");
        appendTerminalLine("Live console disconnected.", "error");
      },
      onError: () => {
        setSocketState("error");
        appendTerminalLine("Live console connection error.", "error");
      },
      onMessage: (message) => {
        appendTerminalLine(message, "socket");
      },
      onOpen: () => {
        setSocketState("connected");
        appendTerminalLine("Live console connected.", "socket");
      },
    });

    return disconnect;
  }, []);

  useEffect(() => {
    terminalBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [terminalLines]);

  return (
    <div className="flex flex-col h-full w-full border-l-2 border-r-2 border-gray-200 overflow-y-auto">
      <div className="flex flex-col">
        <div className="flex items-center justify-center">
          <div className="flex flex-col p-10 justify-center w-[92%] gap-6">
            <div className="flex flex-col gap-2">
              <h1 className="text-3xl font-bold">Train Model Configuration</h1>
              <p className="text-sm text-gray-300">
                Upload your training code, review the JSON configuration, and
                launch a run while watching live updates below.
              </p>
            </div>

            <div className="grid gap-6 xl:grid-cols-[340px_minmax(0,1fr)]">
              <div className="border border-gray-600 rounded-md overflow-hidden bg-[#1f1f1f]">
                <div className="border-b border-gray-600 p-4">
                  <h2 className="text-xl font-bold">Training Assets</h2>
                  <p className="text-sm text-gray-300 mt-1">
                    Attach one or more Python files before starting a job.
                  </p>
                </div>

                <div className="p-4 space-y-4">
                  <label
                    htmlFor="dropzone-file"
                    className="flex flex-col items-center justify-center w-full h-48 border border-dashed border-gray-500 rounded-md cursor-pointer hover:bg-[#2a2a2a]"
                  >
                    <div className="flex flex-col items-center justify-center text-center px-4">
                      <svg
                        aria-hidden="true"
                        className="w-8 h-8 mb-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M15 17h3a3 3 0 0 0 0-6h-.025a5.56 5.56 0 0 0 .025-.5A5.5 5.5 0 0 0 7.207 9.021C7.137 9.017 7.071 9 7 9a4 4 0 1 0 0 8h2.167M12 19v-9m0 0-2 2m2-2 2 2"
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                        />
                      </svg>
                      <p className="text-sm font-semibold">Upload Python Files</p>
                      <p className="text-xs text-gray-400 mt-2">
                        Click here to attach `.py` or `.txt` files
                      </p>
                    </div>
                    <input
                      id="dropzone-file"
                      type="file"
                      accept=".py, .txt"
                      className="hidden"
                      multiple
                      onChange={handleFileChange}
                    />
                  </label>

                  <div className="rounded-md border border-gray-600 bg-[#242424] p-4">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="text-sm font-bold uppercase tracking-wide text-gray-300">
                        Attached Files
                      </h3>
                      <span className="text-xs text-gray-400">
                        {fileNames.length} selected
                      </span>
                    </div>

                    {fileNames.length > 0 ? (
                      <div className="flex flex-col gap-2 mt-4">
                        {fileNames.map((fileName) => (
                          <div
                            className="flex items-center justify-between rounded-md border border-gray-600 px-3 py-2"
                            key={fileName}
                          >
                            <p className="text-sm text-gray-200 truncate">
                              {fileName}
                            </p>
                            <button
                              className="text-sm text-gray-300 hover:text-white"
                              onClick={() => handleDeleteFile(fileName)}
                              type="button"
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-400 mt-4">
                        No files attached yet.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="border border-gray-600 rounded-md overflow-hidden bg-[#1f1f1f]">
                <div className="border-b border-gray-600 p-4">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <h2 className="text-xl font-bold">Configuration JSON</h2>
                      <p className="text-sm text-gray-300 mt-1">
                        Review the training parameters before launching the job.
                      </p>
                    </div>

                    <div
                      className={`rounded-md border px-3 py-2 text-sm ${
                        validatedJson
                          ? "border-green-700 text-green-400"
                          : "border-red-700 text-red-400"
                      }`}
                    >
                      {reasonVisible}
                    </div>
                  </div>
                </div>

                <div className="p-4">
                  <div className="border border-gray-600 rounded-md overflow-hidden">
                    <Editor
                      height="420px"
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
                        fontSize: 16,
                        lineHeight: 26,
                        fontWeight: "500",
                      }}
                    />
                  </div>

                  <div className="flex flex-row flex-wrap gap-2 mt-4">
                    <button
                      className="border-2 border-white text-white px-4 py-2 rounded-md hover:bg-gray-200 hover:text-black"
                      onClick={handleTrainModel}
                      type="button"
                    >
                      Train Model
                    </button>
                    <button
                      className="border border-white text-white px-4 py-2 rounded-md hover:bg-gray-200 hover:text-black"
                      onClick={resetTerminal}
                      type="button"
                    >
                      Clear Console
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="border border-gray-600 rounded-md overflow-hidden bg-[#101010]">
              <div className="flex items-center justify-between gap-4 border-b border-gray-700 px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="flex gap-2">
                    <span className="h-3 w-3 rounded-full bg-red-500" />
                    <span className="h-3 w-3 rounded-full bg-yellow-400" />
                    <span className="h-3 w-3 rounded-full bg-green-500" />
                  </div>
                  <p className="text-sm font-bold">Training Console</p>
                </div>

                <div className="flex items-center gap-3 text-xs">
                  <span
                    className={`rounded-full px-3 py-1 ${
                      socketState === "connected"
                        ? "bg-green-900/40 text-green-400"
                        : socketState === "connecting"
                          ? "bg-yellow-900/40 text-yellow-300"
                          : "bg-red-900/40 text-red-400"
                    }`}
                  >
                    {socketState}
                  </span>
                </div>
              </div>

              <div className="h-[280px] overflow-y-auto bg-[#0b0b0b] px-4 py-4 font-mono text-sm">
                {terminalLines.map((line) => (
                  <div className="flex gap-3 py-1" key={line.id}>
                    <span className="w-20 shrink-0 text-gray-500">{line.time}</span>
                    <span className={lineToneClass(line.tone)}>{line.text}</span>
                  </div>
                ))}
                <div ref={terminalBottomRef} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
