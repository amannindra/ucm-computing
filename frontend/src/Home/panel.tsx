import { NavLink } from "react-router-dom";

const navItems = [
  {
    description: "Upload code, review config, and launch training jobs.",
    title: "Train Model",
    to: "/home/train-model",
  },
  {
    description: "Browse buckets, folders, and files in your storage system.",
    title: "Storage System",
    to: "/home/storage",
  },
];

export default function Panel() {
  return (
    <div className="flex h-full w-full flex-col border-r-2 border-gray-200 bg-[#1a1a1a]">
      <div className="border-b-2 border-gray-200 px-5 py-6">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-yellow-500">
          UCM Computing
        </p>
        <h1 className="mt-3 text-2xl font-bold text-white">Workspace</h1>
        <p className="mt-2 text-sm text-gray-300">
          Switch between model training and storage management.
        </p>
      </div>

      <div className="flex flex-col gap-4 p-4">
        {navItems.map((item) => (
          <NavLink
            className={({ isActive }) =>
              `rounded-md border px-4 py-4 transition ${
                isActive
                  ? "border-yellow-700 bg-yellow-800/20"
                  : "border-gray-600 bg-[#1f1f1f] hover:bg-[#252525]"
              }`
            }
            key={item.to}
            to={item.to}
          >
            {({ isActive }) => (
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-base font-bold text-white">{item.title}</p>
                  <span
                    className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-wide ${
                      isActive
                        ? "bg-yellow-700 text-white"
                        : "bg-[#2b2b2b] text-gray-300"
                    }`}
                  >
                    {isActive ? "Open" : "View"}
                  </span>
                </div>
                <p className="text-sm text-gray-300">{item.description}</p>
              </div>
            )}
          </NavLink>
        ))}
      </div>

      <div className="mt-auto border-t border-gray-700 px-4 py-4">
        <div className="rounded-md border border-gray-600 bg-[#1f1f1f] px-4 py-3">
          <p className="text-xs font-bold uppercase tracking-wide text-gray-400">
            Environment
          </p>
          <p className="mt-2 text-sm text-gray-200">Internal AI dashboard</p>
        </div>
      </div>
    </div>
  );
}
