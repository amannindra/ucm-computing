import { useEffect, useState } from "react";
import { createBucket, deleteBucket, getUserBuckets, renameBucket } from "./backend";
import BucketDetailsPanel from "./components/BucketDetailsPanel";
import BucketListPanel from "./components/BucketListPanel";
import RenameBucketModal from "./components/RenameBucketModal";
import { buildBucketRecords } from "./storageData";
import { getFolderItems } from "./storageFolders";
import type {
  BucketRecord,
  BucketSummary,
  StatusTone,
  StorageItem,
  User,
} from "./types";

export default function StoragePage({ user }: { user: User }) {
  const [buckets, setBuckets] = useState<BucketRecord[]>([]);
  const [bucketSearch, setBucketSearch] = useState("");
  const [objectSearch, setObjectSearch] = useState("");
  const [selectedBucketName, setSelectedBucketName] = useState("");
  const [activeFolderName, setActiveFolderName] = useState<string | null>(null);
  const [bucketBeingRenamedName, setBucketBeingRenamedName] = useState("");
  const [renameValue, setRenameValue] = useState("");
  const [isLoadingBuckets, setIsLoadingBuckets] = useState(true);
  const [isCreatingBucket, setIsCreatingBucket] = useState(false);
  const [isDeletingBucket, setIsDeletingBucket] = useState(false);
  const [isRenamingBucket, setIsRenamingBucket] = useState(false);
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [statusTone, setStatusTone] = useState<StatusTone | null>(null);

  const setStatus = (message: string, tone: StatusTone) => {
    setStatusMessage(message);
    setStatusTone(tone);
  };

  const syncBuckets = (
    bucketSummaries: BucketSummary[],
    preferredBucketName?: string,
  ) => {
    const nextBuckets = buildBucketRecords(bucketSummaries);
    setBuckets(nextBuckets);
    setSelectedBucketName((currentBucketName) => {
      const prioritizedBucketName =
        preferredBucketName &&
        nextBuckets.some((bucket) => bucket.name === preferredBucketName)
          ? preferredBucketName
          : currentBucketName;

      if (
        prioritizedBucketName &&
        nextBuckets.some((bucket) => bucket.name === prioritizedBucketName)
      ) {
        return prioritizedBucketName;
      }

      return nextBuckets[0]?.name ?? "";
    });
  };

  const loadBuckets = async (preferredBucketName?: string) => {
    setIsLoadingBuckets(true);
    const response = await getUserBuckets(user.email);
    if (response.success) {
      syncBuckets(response.buckets, preferredBucketName);
    } else {
      setStatus(response.message, "error");
      syncBuckets([], "");
    }
    setIsLoadingBuckets(false);
  };

  useEffect(() => {
    void loadBuckets();
  }, [user.email]);

  const filteredBuckets = buckets.filter((bucket) =>
    bucket.name.toLowerCase().includes(bucketSearch.toLowerCase()),
  );

  const selectedBucket =
    filteredBuckets.find((bucket) => bucket.name === selectedBucketName) ??
    filteredBuckets[0] ??
    buckets[0] ??
    null;

  useEffect(() => { 
    setActiveFolderName(null);
    setObjectSearch("");
  }, [selectedBucket?.name]);

  const visibleItems: StorageItem[] = selectedBucket
    ? activeFolderName
      ? getFolderItems(activeFolderName)
      : selectedBucket.items
    : [];

  const filteredItems = visibleItems.filter((item) =>
    item.name.toLowerCase().includes(objectSearch.toLowerCase()),
  );

  const openRenameModal = (bucketName: string) => {
    setBucketBeingRenamedName(bucketName);
    setRenameValue(bucketName);
    setSelectedBucketName(bucketName);
    setIsRenameModalOpen(true);
  };

  const closeRenameModal = () => {
    if (isRenamingBucket) {
      return;
    }
    setIsRenameModalOpen(false);
    setBucketBeingRenamedName("");
  };

  const handleCreateBucket = async () => {
    setIsCreatingBucket(true);
    const response = await createBucket(user.email);
    if (response.success) {
      setStatus(response.message, "success");
      await loadBuckets(response.bucket_name);
    } else {
      setStatus(response.message, "error");
    }
    setIsCreatingBucket(false);
  };

  const handleRenameBucket = async () => {
    if (!bucketBeingRenamedName) {
      return;
    }

    setIsRenamingBucket(true);
    const response = await renameBucket(
      user.email,
      bucketBeingRenamedName,
      renameValue,
    );
    if (response.success) {
      setStatus(response.message, "success");
      setIsRenameModalOpen(false);
      setBucketBeingRenamedName("");
      await loadBuckets(response.bucket_name);
    } else {
      setStatus(response.message, "error");
    }
    setIsRenamingBucket(false);
  };

  const handleDeleteBucket = async () => {
    if (!selectedBucket?.name) {
      return;
    }

    setIsDeletingBucket(true);
    const response = await deleteBucket(user.email, selectedBucket.name);
    if (response.success) {
      setStatus(response.message, "success");
      await loadBuckets();
    } else {
      setStatus(response.message, "error");
    }
    setIsDeletingBucket(false);
  };

  const renameDisabled =
    !bucketBeingRenamedName ||
    !renameValue.trim() ||
    renameValue.trim().toLowerCase() ===
      bucketBeingRenamedName.trim().toLowerCase() ||
    isRenamingBucket;

  return (
    <div className="flex h-full w-full">
      <div className="flex h-full w-full flex-col overflow-y-auto border-l-2 border-r-2 border-gray-200">
        <div className="flex flex-col">
          <div className="flex justify-center">
            <div className="flex w-[92%] flex-col gap-6 p-10">
              <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold">Storage Configuration</h1>
                <p className="text-sm text-gray-300">
                  View your buckets and browse the folders and files inside each
                  bucket.
                </p>
              </div>

              <div className="flex flex-row flex-wrap gap-2">
                <button
                  className="rounded-md border-2 border-white px-4 py-2 text-white hover:bg-gray-200 hover:text-black disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={isCreatingBucket}
                  onClick={() => void handleCreateBucket()}
                  type="button"
                >
                  {isCreatingBucket ? "Creating..." : "Create Bucket"}
                </button> 
                <button
                  className="rounded-md border-2 border-white px-4 py-2 text-white hover:bg-gray-200 hover:text-black disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={isDeletingBucket || !selectedBucket}
                  onClick={() => void handleDeleteBucket()}
                  type="button"
                >
                  {isDeletingBucket ? "Deleting..." : "Delete Bucket"}
                </button>
                <button
                  className="rounded-md border-2 border-white px-4 py-2 text-white hover:bg-gray-200 hover:text-black disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={isLoadingBuckets || isCreatingBucket || isRenamingBucket}
                  onClick={() => void loadBuckets(selectedBucketName)}
                  type="button"
                >
                  {isLoadingBuckets ? "Refreshing..." : "Refresh"}
                </button>
              </div>

              {statusMessage && (
                <div
                  className={`rounded-md border px-4 py-3 text-sm ${
                    statusTone === "success"
                      ? "border-green-600 bg-green-900/20 text-green-200"
                      : "border-red-600 bg-red-900/20 text-red-200"
                  }`}
                >
                  {statusMessage}
                </div>
              )}

              <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
                <BucketListPanel
                  bucketSearch={bucketSearch}
                  buckets={buckets}
                  filteredBuckets={filteredBuckets}
                  isLoadingBuckets={isLoadingBuckets}
                  onBucketSearchChange={setBucketSearch}
                  onOpenRenameModal={openRenameModal}
                  onSelectBucket={setSelectedBucketName}
                  selectedBucketName={selectedBucket?.name ?? null}
                />

                <BucketDetailsPanel
                  activeFolderName={activeFolderName}
                  filteredItems={filteredItems}
                  itemCount={visibleItems.length}
                  objectSearch={objectSearch}
                  onBackToBucket={() => setActiveFolderName(null)}
                  onFolderOpen={setActiveFolderName}
                  onObjectSearchChange={setObjectSearch}
                  selectedBucket={selectedBucket}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <RenameBucketModal
        bucketName={bucketBeingRenamedName}
        isOpen={isRenameModalOpen}
        isRenamingBucket={isRenamingBucket}
        onClose={closeRenameModal}
        onRename={() => void handleRenameBucket()}
        onRenameValueChange={setRenameValue}
        renameDisabled={renameDisabled}
        renameValue={renameValue}
      />
    </div>
  );
}
