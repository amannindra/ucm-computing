import type { StorageItem } from "../types";

export default function ItemIcon({ type }: { type: StorageItem["type"] }) {
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
