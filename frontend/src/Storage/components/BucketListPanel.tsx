import { bucketCountLabel } from "../storageData";
import type { BucketRecord } from "../types";

type BucketListPanelProps = {
  bucketSearch: string;
  buckets: BucketRecord[];
  filteredBuckets: BucketRecord[];
  isLoadingBuckets: boolean;
  onBucketSearchChange: (value: string) => void;
  onOpenRenameModal: (bucketName: string) => void;
  onSelectBucket: (bucketName: string) => void;
  selectedBucketName: string | null;
};

export default function BucketListPanel({
  bucketSearch,
  buckets,
  filteredBuckets,
  isLoadingBuckets,
  onBucketSearchChange,
  onOpenRenameModal,
  onSelectBucket,
  selectedBucketName,
}: BucketListPanelProps) {
  return (
    <div className="overflow-hidden rounded-md border border-gray-600 bg-[#1f1f1f]">
      <div className="border-b border-gray-600 p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold">Buckets</h2>
            <p className="mt-1 text-xs text-gray-400">
              {filteredBuckets.length} total buckets
            </p>
          </div>
        </div>
        <input
          className="mt-4 w-full rounded-md border border-gray-500 bg-[#242424] px-3 py-2 text-sm text-white outline-none focus:border-white"
          onChange={(event) => onBucketSearchChange(event.target.value)}
          placeholder="Search buckets"
          value={bucketSearch}
        />
      </div>

      <div className="grid grid-cols-[1.6fr_1fr] gap-4 border-b border-gray-600 px-4 py-3 text-xs font-bold uppercase tracking-wide text-gray-400">
        <p>Bucket Name</p>
        <p>Date Created</p>
      </div>

      <div className="flex flex-col">
        {isLoadingBuckets && (
          <div className="px-4 py-10 text-center text-sm text-gray-400">
            Loading buckets...
          </div>
        )}

        {!isLoadingBuckets &&
          filteredBuckets.map((bucket) => {
            const isSelected = bucket.name === selectedBucketName;

            return (
              <button
                key={bucket.name}
                className={`grid grid-cols-[1.6fr_1fr] gap-4 border-b border-gray-700 px-4 py-4 text-left ${
                  isSelected ? "bg-yellow-800/30" : "hover:bg-[#2a2a2a]"
                }`}
                onClick={() => onSelectBucket(bucket.name)}
                type="button"
              >
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-bold underline">{bucket.name}</p>
                  <button
                    className="w-fit text-xs text-gray-400 underline hover:text-white"
                    onClick={(event) => {
                      event.stopPropagation();
                      onOpenRenameModal(bucket.name);
                    }}
                    type="button"
                  >
                    rename
                  </button>
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

        {!isLoadingBuckets && filteredBuckets.length === 0 && buckets.length > 0 && (
          <div className="px-4 py-10 text-center text-sm text-gray-400">
            No buckets match your search.
          </div>
        )}

        {!isLoadingBuckets && buckets.length === 0 && (
          <div className="px-4 py-10 text-center text-sm text-gray-400">
            No buckets have been created for this account yet.
          </div>
        )}
      </div>
    </div>
  );
}
