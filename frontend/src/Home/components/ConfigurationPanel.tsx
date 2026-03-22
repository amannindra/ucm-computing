import Editor from "@monaco-editor/react";
import data from "../data.json";
import type { EditorInstance } from "../trainModelTypes";

type ConfigurationPanelProps = {
  handleEditorChange: (value: string | undefined) => void;
  handleEditorDidMount: (editor: EditorInstance) => void;
  handleEditorWillMount: (monaco: any) => void;
  onClearConsole: () => void;
  onTrainModel: () => void;
  reasonVisible: string;
  validatedJson: boolean;
};

export default function ConfigurationPanel({
  handleEditorChange,
  handleEditorDidMount,
  handleEditorWillMount,
  onClearConsole,
  onTrainModel,
  reasonVisible,
  validatedJson,
}: ConfigurationPanelProps) {
  return (
    <div className="overflow-hidden rounded-md border border-gray-600 bg-[#1f1f1f]">
      <div className="border-b border-gray-600 p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2 className="text-xl font-bold">Configuration JSON</h2>
            <p className="mt-1 text-sm text-gray-300">
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
        <div className="overflow-hidden rounded-md border border-gray-600">
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

        <div className="mt-4 flex flex-row flex-wrap gap-2">
          <button
            className="rounded-md border-2 border-white px-4 py-2 text-white hover:bg-gray-200 hover:text-black"
            onClick={onTrainModel}
            type="button"
          >
            Train Model
          </button>
          <button
            className="rounded-md border border-white px-4 py-2 text-white hover:bg-gray-200 hover:text-black"
            onClick={onClearConsole}
            type="button"
          >
            Clear Console
          </button>
        </div>
      </div>
    </div>
  );
}
