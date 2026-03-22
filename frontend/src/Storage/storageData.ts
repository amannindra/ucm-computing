import type { BucketRecord } from "./types";

const fallbackBucketProfiles: Omit<BucketRecord, "name">[] = [
  {
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
        name: "dsdsa/",
        type: "Folder",
        size: "-",
        lastModified: "March 20, 2026",
      },
      {
        name: "checkpodasdsaints/",
        type: "Folder",
        size: "-",
        lastModified: "March 20, 2026",
      },
      {
        name: "cheasdsadckpoints/",
        type: "Folder",
        size: "-",
        lastModified: "March 20, 2026",
      },
      {
        name: "cheadsackpoints/",
        type: "Folder",
        size: "-",
        lastModified: "March 20, 2026",
      },
      {
        name: "checkadsapoints/",
        type: "Folder",
        size: "-",
        lastModified: "March 20, 2026",
      },
      {
        name: "checkpodasdints/",
        type: "Folder",
        size: "-",
        lastModified: "March 20, 2026",
      },
      {
        name: "checkpoiasdsadnts/",
        type: "Folder",
        size: "-",
        lastModified: "March 20, 2026",
      },
      {
        name: "checkpadsadints/",
        type: "Folder",
        size: "-",
        lastModified: "March 20, 2026",
      },
      {
        name: "checkpfdsdsfsgsoints/",
        type: "Folder",
        size: "-",
        lastModified: "March 20, 2026",
      },
      {
        name: "adsdsa/",
        type: "Folder",
        size: "-",
        lastModified: "March 20, 2026",
      },
      {
        name: "checkadaspoints/",
        type: "Folder",
        size: "-",
        lastModified: "March 20, 2026",
      },
      {
        name: "checkadsaasdaoints/",
        type: "Folder",
        size: "-",
        lastModified: "March 20, 2026",
      },
      {
        name: "checkaddsadsaaspoints/",
        type: "Folder",
        size: "-",
        lastModified: "March 20, 2026",
      },
      {
        name: "checkadsaoasdasints/",
        type: "Folder",
        size: "-",
        lastModified: "March 20, 2026",
      },
      {
        name: "checkadaspasdsaoints/",
        type: "Folder",
        size: "-",
        lastModified: "March 20, 2026",
      },
      {
        name: "cheasdsadckadsaoints/",
        type: "Folder",
        size: "-",
        lastModified: "March 20, 2026",
      },
      {
        name: "checkadaspadsaoints/",
        type: "Folder",
        size: "-",
        lastModified: "March 20, 2026",
      },
      {
        name: "chedsadsadkadsaoints/",
        type: "Folder",
        size: "-",
        lastModified: "March 20, 2026",
      },
      {
        name: "checkadaspadasdadaoints/",
        type: "Folder",
        size: "-",
        lastModified: "March 20, 2026",
      },
      {
        name: "checkadsfdsfdsaoints/",
        type: "Folder",
        size: "-",
        lastModified: "March 20, 2026",
      },
      {
        name: "checkadasdadadaspoints/",
        type: "Folder",
        size: "-",
        lastModified: "March 20, 2026",
      },
      {
        name: "checkadssdfdsfaoints/",
        type: "Folder",
        size: "-",
        lastModified: "March 20, 2026",
      },
      {
        name: "checkadaadsadaasspoints/",
        type: "Folder",
        size: "-",
        lastModified: "March 20, 2026",
      },
      {
        name: "checkdsadaspoints/",
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

export function buildBucketRecords(bucketNames: string[]): BucketRecord[] {
  return bucketNames
    .slice()
    .sort((left, right) => left.localeCompare(right))
    .map((name, index) => {
      const profile = fallbackBucketProfiles[index % fallbackBucketProfiles.length];
      return {
        name,
        createdAt: profile.createdAt,
        region: profile.region,
        items: profile.items,
      };
    });
}

export function bucketCountLabel(itemCount: number) {
  return itemCount === 1 ? "1 object" : `${itemCount} objects`;
}
