type RenameBucketModalProps = {
  bucketName: string;
  isOpen: boolean;
  isRenamingBucket: boolean;
  onClose: () => void;
  onRename: () => void;
  onRenameValueChange: (value: string) => void;
  renameDisabled: boolean;
  renameValue: string;
};

export default function RenameBucketModal({
  bucketName,
  isOpen,
  isRenamingBucket,
  onClose,
  onRename,
  onRenameValueChange,
  renameDisabled,
  renameValue,
}: RenameBucketModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="w-full max-w-md rounded-md border border-gray-600 bg-[#1f1f1f] p-6 shadow-2xl">
        <div className="flex flex-col gap-2">
          <h2 className="text-xl font-bold text-white">Rename Bucket</h2>
          <p className="text-sm text-gray-300">Change the name for `{bucketName}`.</p>
        </div>

        <div className="mt-5 flex flex-col gap-3">
          <input
            className="w-full rounded-md border border-gray-500 bg-[#242424] px-3 py-2 text-sm text-white outline-none focus:border-white"
            onChange={(event) => onRenameValueChange(event.target.value)}
            placeholder="Enter a new bucket name"
            value={renameValue}
          />
          <p className="text-xs text-gray-400">
            Bucket names must be 3-63 characters and use lowercase letters,
            numbers, or hyphens only.
          </p>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            className="rounded-md border border-gray-500 px-4 py-2 text-sm text-gray-200 hover:bg-[#2a2a2a]"
            onClick={onClose}
            type="button"
          >
            Cancel
          </button>
          <button
            className="rounded-md border border-white px-4 py-2 text-sm text-white hover:bg-gray-200 hover:text-black disabled:cursor-not-allowed disabled:opacity-50"
            disabled={renameDisabled}
            onClick={onRename}
            type="button"
          >
            {isRenamingBucket ? "Renaming..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
