import type { StorageItem } from "./types";

const folderContents: Record<string, StorageItem[]> = {
  "checkpoints/": [
    {
      name: "epoch-01.ckpt",
      type: "File",
      size: "84 MB",
      lastModified: "March 20, 2026",
    },
    {
      name: "epoch-02.ckpt",
      type: "File",
      size: "86 MB",
      lastModified: "March 20, 2026",
    },
    {
      name: "best-model.ckpt",
      type: "File",
      size: "88 MB",
      lastModified: "March 21, 2026",
    },
  ],
  "datasets/": [
    {
      name: "train.csv",
      type: "File",
      size: "210 MB",
      lastModified: "March 18, 2026",
    },
    {
      name: "valid.csv",
      type: "File",
      size: "44 MB",
      lastModified: "March 18, 2026",
    },
    {
      name: "labels.json",
      type: "File",
      size: "18 KB",
      lastModified: "March 18, 2026",
    },
  ],
  "2026-03-18/": [
    {
      name: "worker-01.log",
      type: "File",
      size: "2.4 MB",
      lastModified: "March 18, 2026",
    },
    {
      name: "worker-02.log",
      type: "File",
      size: "2.7 MB",
      lastModified: "March 18, 2026",
    },
    {
      name: "summary.txt",
      type: "File",
      size: "16 KB",
      lastModified: "March 18, 2026",
    },
  ],
  "2026-03-19/": [
    {
      name: "worker-01.log",
      type: "File",
      size: "2.6 MB",
      lastModified: "March 19, 2026",
    },
    {
      name: "worker-02.log",
      type: "File",
      size: "2.9 MB",
      lastModified: "March 19, 2026",
    },
    {
      name: "summary.txt",
      type: "File",
      size: "17 KB",
      lastModified: "March 19, 2026",
    },
  ],
  "gpt-run-17/": [
    {
      name: "adapter.bin",
      type: "File",
      size: "640 MB",
      lastModified: "March 16, 2026",
    },
    {
      name: "tokenizer.json",
      type: "File",
      size: "1.3 MB",
      lastModified: "March 16, 2026",
    },
    {
      name: "notes.md",
      type: "File",
      size: "5 KB",
      lastModified: "March 16, 2026",
    },
  ],
  "gpt-run-18/": [
    {
      name: "adapter.bin",
      type: "File",
      size: "652 MB",
      lastModified: "March 17, 2026",
    },
    {
      name: "tokenizer.json",
      type: "File",
      size: "1.3 MB",
      lastModified: "March 17, 2026",
    },
    {
      name: "notes.md",
      type: "File",
      size: "6 KB",
      lastModified: "March 17, 2026",
    },
  ],
};

export function getFolderItems(folderName: string): StorageItem[] {
  return folderContents[folderName] ?? [
    {
      name: "readme.txt",
      type: "File",
      size: "4 KB",
      lastModified: "March 21, 2026",
    },
    {
      name: "manifest.json",
      type: "File",
      size: "9 KB",
      lastModified: "March 21, 2026",
    },
    {
      name: "preview.csv",
      type: "File",
      size: "120 KB",
      lastModified: "March 21, 2026",
    },
  ];
}
