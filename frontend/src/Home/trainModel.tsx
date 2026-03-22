import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { connectToWebSocket, sendJsonPythonFile, validateJson } from "./backend";
import ConfigurationPanel from "./components/ConfigurationPanel";
import TrainingAssetsPanel from "./components/TrainingAssetsPanel";
import TrainingConsole from "./components/TrainingConsole";
import type {
  EditorInstance,
  TerminalLine,
  TerminalTone,
  User,
  ValidationResult,
} from "./trainModelTypes";
import { initialTerminalMessage, timestamp } from "./trainModelUtils";

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

  const handleEditorChange = (value: string | undefined) => {
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
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files ?? []);

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
    event.target.value = "";
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

  const handleEditorWillMount = (monaco: any) => {
    monaco.editor.defineTheme("customDarkTheme", {
      base: "vs-dark",
      inherit: true,
      rules: [],
      colors: {
        "editor.background": "#242424",
      },
    });
  };

  const handleEditorDidMount = (editor: EditorInstance) => {
    editorRef.current = editor;
  };

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
    <div className="flex h-full w-full flex-col overflow-y-auto border-l-2 border-r-2 border-gray-200">
      <div className="flex flex-col">
        <div className="flex items-center justify-center">
          <div className="flex w-[92%] flex-col justify-center gap-6 p-10">
            <div className="flex flex-col gap-2">
              <h1 className="text-3xl font-bold">Train Model Configuration</h1>
              <p className="text-sm text-gray-300">
                Upload your training code, review the JSON configuration, and
                launch a run while watching live updates below.
              </p>
            </div>

            <div className="grid gap-6 xl:grid-cols-[340px_minmax(0,1fr)]">
              <TrainingAssetsPanel
                fileNames={fileNames}
                onDeleteFile={handleDeleteFile}
                onFileChange={handleFileChange}
              />

              <ConfigurationPanel
                handleEditorChange={handleEditorChange}
                handleEditorDidMount={handleEditorDidMount}
                handleEditorWillMount={handleEditorWillMount}
                onClearConsole={resetTerminal}
                onTrainModel={() => void handleTrainModel()}
                reasonVisible={reasonVisible}
                validatedJson={validatedJson}
              />
            </div>

            <TrainingConsole
              socketState={socketState}
              terminalBottomRef={terminalBottomRef}
              terminalLines={terminalLines}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
