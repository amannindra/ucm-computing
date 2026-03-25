export type User = {
  uuid: string;
  name: string;
  email: string;
  password: string;
};

export type StorageItem = {
  name: string;
  type: "Folder" | "File";
  size: string;
  lastModified: string;
};

export type BucketRecord = {
  name: string;
  createdAt: string;
  region: string;
  items: StorageItem[];
};

export type BucketSummary = {
  name: string;
  createdAt: string;
};

export type StatusTone = "error" | "success";
