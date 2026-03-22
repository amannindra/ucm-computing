import { bucketCountLabel } from "../storageData";
import type { BucketRecord, StorageItem } from "../types";
import ItemIcon from "./ItemIcon";

type BucketDetailsPanelProps = {
  activeFolderName: string | null;
  filteredItems: StorageItem[];
  itemCount: number;
  onBackToBucket: () => void;
  onFolderOpen: (folderName: string) => void;
  objectSearch: string;
  onObjectSearchChange: (value: string) => void;
  selectedBucket: BucketRecord | null;
};

export default function BucketDetailsPanel({
  activeFolderName,
  filteredItems,
  itemCount,
  onBackToBucket,
  onFolderOpen,
  objectSearch,
  onObjectSearchChange,
  selectedBucket,
}: BucketDetailsPanelProps) {
  return (
    <div className="overflow-hidden rounded-md border border-gray-600 bg-[#1f1f1f]">
      <div className="border-b border-gray-600 p-4">
        {selectedBucket ? (
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h2 className="text-2xl font-bold">{selectedBucket.name}</h2>
              <p className="mt-1 text-sm text-gray-300">
                Amazon S3 style object browser for this bucket.
              </p>
              <p className="mt-2 text-xs text-gray-400">
                s3 &gt; {selectedBucket.name}
                {activeFolderName ? ` > ${activeFolderName}` : ""}
              </p>
            </div>

            <div className="flex flex-row flex-wrap gap-2">
              <button
                className="rounded-md border border-white px-3 py-2 text-white hover:bg-gray-200 hover:text-black"
                type="button"
              >
                Upload
              </button>
              <button
                className="rounded-md border border-white px-3 py-2 text-white hover:bg-gray-200 hover:text-black"
                type="button"
              >
                Download
              </button>
              <button
                className="rounded-md border border-white px-3 py-2 text-white hover:bg-gray-200 hover:text-black"
                type="button"
              >
                Delete
              </button>
            </div>
          </div>
        ) : (
          <div>
            <h2 className="text-2xl font-bold">Bucket Details</h2>
            <p className="mt-1 text-sm text-gray-300">
              Create a bucket to start managing storage for this user.
            </p>
          </div>
        )}

        {selectedBucket && (
          <div className="mt-4 grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px_180px]">
            <input
              className="rounded-md border border-gray-500 bg-[#242424] px-3 py-2 text-sm text-white outline-none focus:border-white"
              onChange={(event) => onObjectSearchChange(event.target.value)}
              placeholder={
                activeFolderName
                  ? "Search files in folder"
                  : "Search folders and files"
              }
              value={objectSearch}
            />
            <div className="rounded-md border border-gray-600 px-3 py-2 text-sm text-gray-300">
              {activeFolderName ? (
                <button
                  className="text-left text-white underline hover:text-gray-200"
                  onClick={onBackToBucket}
                  type="button"
                >
                  Back to bucket root
                </button>
              ) : (
                <>Region: {selectedBucket.region}</>
              )}
            </div>
            <div className="rounded-md border border-gray-600 px-3 py-2 text-sm text-gray-300">
              {bucketCountLabel(itemCount)}
            </div>
          </div>
        )}
      </div>

      {selectedBucket && (
        <>
          <div className="grid grid-cols-[1.8fr_0.9fr_1fr_1fr] gap-4 border-b border-gray-600 px-4 py-3 text-xs font-bold uppercase tracking-wide text-gray-400">
            <p>Name</p>
            <p>Type</p>
            <p>Last Modified</p>
            <p>Size</p>
          </div>

          <div className="flex flex-col">
            {filteredItems.map((item) => (
              <div
                className="grid grid-cols-[1.8fr_0.9fr_1fr_1fr] gap-4 border-b border-gray-700 px-4 py-4 hover:bg-[#2a2a2a]"
                key={item.name}
              >
                <div className="flex min-w-0 items-center gap-3">
                  <ItemIcon type={item.type} />
                  {item.type === "Folder" ? (
                    <button
                      className="truncate text-left text-sm font-medium underline"
                      onClick={() => onFolderOpen(item.name)}
                      type="button"
                    >
                      {item.name}
                    </button>
                  ) : (
                    <p className="truncate text-sm font-medium">{item.name}</p>
                  )}
                </div>
                <p className="text-sm">{item.type}</p>
                <p className="text-sm text-gray-300">{item.lastModified}</p>
                <p className="text-sm text-gray-300">{item.size}</p>
              </div>
            ))}

            {filteredItems.length === 0 && (
              <div className="px-4 py-10 text-center text-sm text-gray-400">
                No folders or files match your search.
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
