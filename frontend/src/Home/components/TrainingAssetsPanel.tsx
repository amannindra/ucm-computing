import type { ChangeEvent } from "react";

type TrainingAssetsPanelProps = {
  fileNames: string[];
  onDeleteFile: (fileName: string) => void;
  onFileChange: (event: ChangeEvent<HTMLInputElement>) => void;
};

export default function TrainingAssetsPanel({
  fileNames,
  onDeleteFile,
  onFileChange,
}: TrainingAssetsPanelProps) {
  return (
    <div className="overflow-hidden rounded-md border border-gray-600 bg-[#1f1f1f]">
      <div className="border-b border-gray-600 p-4">
        <h2 className="text-xl font-bold">Training Assets</h2>
        <p className="mt-1 text-sm text-gray-300">
          Attach one or more Python files before starting a job.
        </p>
      </div>

      <div className="space-y-4 p-4">
        <label
          htmlFor="dropzone-file"
          className="flex h-48 w-full cursor-pointer flex-col items-center justify-center rounded-md border border-dashed border-gray-500 hover:bg-[#2a2a2a]"
        >
          <div className="flex flex-col items-center justify-center px-4 text-center">
            <svg
              aria-hidden="true"
              className="mb-4 h-8 w-8"
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
            <p className="mt-2 text-xs text-gray-400">
              Click here to attach `.py` or `.txt` files
            </p>
          </div>
          <input
            id="dropzone-file"
            type="file"
            accept=".py, .txt"
            className="hidden"
            multiple
            onChange={onFileChange}
          />
        </label>

        <div className="rounded-md border border-gray-600 bg-[#242424] p-4">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-sm font-bold uppercase tracking-wide text-gray-300">
              Attached Files
            </h3>
            <span className="text-xs text-gray-400">{fileNames.length} selected</span>
          </div>

          {fileNames.length > 0 ? (
            <div className="mt-4 flex flex-col gap-2">
              {fileNames.map((fileName) => (
                <div
                  className="flex items-center justify-between rounded-md border border-gray-600 px-3 py-2"
                  key={fileName}
                >
                  <p className="truncate text-sm text-gray-200">{fileName}</p>
                  <button
                    className="text-sm text-gray-300 hover:text-white"
                    onClick={() => onDeleteFile(fileName)}
                    type="button"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-4 text-sm text-gray-400">No files attached yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
