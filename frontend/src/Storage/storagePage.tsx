import { useState } from "react";

type StorageItem = {
  name: string;
  type: "Folder" | "File";
  size: string;
  lastModified: string;
};

type BucketRecord = {
  name: string;
  createdAt: string;
  region: string;
  items: StorageItem[];
};

const buckets: BucketRecord[] = [
  {
    name: "training-artifacts",
    createdAt: "February 22, 2026",
    region: "us-east-1",
    items: [
      {
        name: "checkpoints/",
        type: "Folder",
        size: "-",
        lastModified: "March 20, 2026",
      },
      {
        name: "datasets/",
        type: "Folder",
        size: "-",
        lastModified: "March 18, 2026",
      },
      {
        name: "train.log",
        type: "File",
        size: "12.4 MB",
        lastModified: "March 21, 2026",
      },
      {
        name: "metrics.json",
        type: "File",
        size: "240 KB",
        lastModified: "March 21, 2026",
      },
    ],
  },
  {
    name: "agent-logs",
    createdAt: "March 03, 2026",
    region: "us-west-2",
    items: [
      {
        name: "2026-03-18/",
        type: "Folder",
        size: "-",
        lastModified: "March 18, 2026",
      },
      {
        name: "2026-03-19/",
        type: "Folder",
        size: "-",
        lastModified: "March 19, 2026",
      },
      {
        name: "request-summary.csv",
        type: "File",
        size: "1.1 MB",
        lastModified: "March 20, 2026",
      },
    ],
  },
  {
    name: "model-backups",
    createdAt: "January 11, 2026",
    region: "us-east-2",
    items: [
      {
        name: "gpt-run-17/",
        type: "Folder",
        size: "-",
        lastModified: "March 16, 2026",
      },
      {
        name: "gpt-run-18/",
        type: "Folder",
        size: "-",
        lastModified: "March 17, 2026",
      },
      {
        name: "restore-notes.txt",
        type: "File",
        size: "18 KB",
        lastModified: "March 18, 2026",
      },
    ],
  },
];

function bucketCountLabel(itemCount: number) {
  return itemCount === 1 ? "1 object" : `${itemCount} objects`;
}

function ItemIcon({ type }: { type: StorageItem["type"] }) {
  if (type === "Folder") {
    return (
      <svg
        aria-hidden="true"
        className="h-4 w-4 text-yellow-400"
        fill="none"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M3.75 7.5A2.25 2.25 0 0 1 6 5.25h3.129c.597 0 1.169.237 1.591.659l.621.621c.422.422.994.659 1.591.659H18A2.25 2.25 0 0 1 20.25 9.44v7.31A2.25 2.25 0 0 1 18 19H6a2.25 2.25 0 0 1-2.25-2.25V7.5Z"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
        />
      </svg>
    );
  }

  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4 text-gray-300"
      fill="none"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M7.5 3.75h6.69c.398 0 .779.158 1.06.44l2.56 2.56c.281.281.44.662.44 1.06V18A2.25 2.25 0 0 1 16 20.25H7.5A2.25 2.25 0 0 1 5.25 18V6A2.25 2.25 0 0 1 7.5 3.75Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
      <path
        d="M14.25 3.75V7.5h3.75"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </svg>
  );
}

export default function StoragePage() {
  const [bucketSearch, setBucketSearch] = useState("");
  const [objectSearch, setObjectSearch] = useState("");
  const [selectedBucketName, setSelectedBucketName] = useState(buckets[0].name);

  const filteredBuckets = buckets.filter((bucket) =>
    bucket.name.toLowerCase().includes(bucketSearch.toLowerCase()),
  );

  const selectedBucket =
    filteredBuckets.find((bucket) => bucket.name === selectedBucketName) ??
    filteredBuckets[0] ??
    buckets[0];

  const filteredItems = selectedBucket.items.filter((item) =>
    item.name.toLowerCase().includes(objectSearch.toLowerCase()),
  );

  return (
    <div className="flex h-full w-full">
      <div className="flex flex-col h-full w-full border-l-2 border-r-2 border-gray-200 overflow-y-auto">
        <div className="flex flex-col">
          <div className="flex justify-center">
            <div className="flex flex-col p-10 w-[92%] gap-6">
              <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold">Storage Configuration</h1>
                <p className="text-sm text-gray-300">
                  View your buckets and browse the folders and files inside each
                  bucket.
                </p>
              </div>

              <div className="flex flex-row flex-wrap gap-2">
                <button className="border-2 border-white text-white px-4 py-2 rounded-md hover:bg-gray-200 hover:text-black">
                  Create Bucket
                </button>
                <button className="border-2 border-white text-white px-4 py-2 rounded-md hover:bg-gray-200 hover:text-black">
                  Upload File
                </button>
                <button className="border-2 border-white text-white px-4 py-2 rounded-md hover:bg-gray-200 hover:text-black">
                  Create Folder
                </button>
              </div>

              <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
                <div className="border border-gray-600 rounded-md overflow-hidden bg-[#1f1f1f]">
                  <div className="border-b border-gray-600 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <h2 className="text-xl font-bold">Buckets</h2>
                        <p className="text-xs text-gray-400 mt-1">
                          {filteredBuckets.length} total buckets
                        </p>
                      </div>
                    </div>
                    <input
                      className="mt-4 w-full rounded-md border border-gray-500 bg-[#242424] px-3 py-2 text-sm text-white outline-none focus:border-white"
                      onChange={(event) => setBucketSearch(event.target.value)}
                      placeholder="Search buckets"
                      value={bucketSearch}
                    />
                  </div>

                  <div className="grid grid-cols-[1.6fr_1fr] gap-4 border-b border-gray-600 px-4 py-3 text-xs font-bold uppercase tracking-wide text-gray-400">
                    <p>Bucket Name</p>
                    <p>Date Created</p>
                  </div>

                  <div className="flex flex-col">
                    {filteredBuckets.map((bucket) => {
                      const isSelected = bucket.name === selectedBucket.name;

                      return (
                        <button
                          key={bucket.name}
                          className={`grid grid-cols-[1.6fr_1fr] gap-4 border-b border-gray-700 px-4 py-4 text-left ${
                            isSelected
                              ? "bg-yellow-800/30"
                              : "hover:bg-[#2a2a2a]"
                          }`}
                          onClick={() => setSelectedBucketName(bucket.name)}
                          type="button"
                        >
                          <div className="flex flex-col gap-1">
                            <p className="text-sm font-bold underline">
                              {bucket.name}
                            </p>
                            <p className="text-xs text-gray-400">
                              {bucket.region}
                            </p>
                          </div>
                          <div className="flex flex-col gap-1">
                            <p className="text-sm">{bucket.createdAt}</p>
                            <p className="text-xs text-gray-400">
                              {bucketCountLabel(bucket.items.length)}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="border border-gray-600 rounded-md overflow-hidden bg-[#1f1f1f]">
                  <div className="border-b border-gray-600 p-4">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div>
                        <h2 className="text-2xl font-bold">{selectedBucket.name}</h2>
                        <p className="text-sm text-gray-300 mt-1">
                          Amazon S3 style object browser for this bucket.
                        </p>
                        <p className="text-xs text-gray-400 mt-2">
                          s3 &gt; {selectedBucket.name}
                        </p>
                      </div>

                      <div className="flex flex-row flex-wrap gap-2">
                        <button className="border border-white text-white px-3 py-2 rounded-md hover:bg-gray-200 hover:text-black">
                          Upload
                        </button>
                        <button className="border border-white text-white px-3 py-2 rounded-md hover:bg-gray-200 hover:text-black">
                          Download
                        </button>
                        <button className="border border-white text-white px-3 py-2 rounded-md hover:bg-gray-200 hover:text-black">
                          Delete
                        </button>
                      </div>
                    </div>

                    <div className="grid gap-3 mt-4 lg:grid-cols-[minmax(0,1fr)_220px_180px]">
                      <input
                        className="rounded-md border border-gray-500 bg-[#242424] px-3 py-2 text-sm text-white outline-none focus:border-white"
                        onChange={(event) => setObjectSearch(event.target.value)}
                        placeholder="Search folders and files"
                        value={objectSearch}
                      />
                      <div className="rounded-md border border-gray-600 px-3 py-2 text-sm text-gray-300">
                        Region: {selectedBucket.region}
                      </div>
                      <div className="rounded-md border border-gray-600 px-3 py-2 text-sm text-gray-300">
                        {bucketCountLabel(selectedBucket.items.length)}
                      </div>
                    </div>
                  </div>

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
                        <div className="flex items-center gap-3 min-w-0">
                          <ItemIcon type={item.type} />
                          <p className="truncate text-sm font-medium">{item.name}</p>
                        </div>
                        <p className="text-sm">{item.type}</p>
                        <p className="text-sm text-gray-300">
                          {item.lastModified}
                        </p>
                        <p className="text-sm text-gray-300">{item.size}</p>
                      </div>
                    ))}

                    {filteredItems.length === 0 && (
                      <div className="px-4 py-10 text-center text-sm text-gray-400">
                        No folders or files match your search.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
