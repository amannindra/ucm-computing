import type { RefObject } from "react";
import { lineToneClass } from "../trainModelUtils";
import type { TerminalLine } from "../trainModelTypes";

type TrainingConsoleProps = {
  socketState: string;
  terminalBottomRef: RefObject<HTMLDivElement | null>;
  terminalLines: TerminalLine[];
};

export default function TrainingConsole({
  socketState,
  terminalBottomRef,
  terminalLines,
}: TrainingConsoleProps) {
  return (
    <div className="overflow-hidden rounded-md border border-gray-600 bg-[#101010]">
      <div className="flex items-center justify-between gap-4 border-b border-gray-700 px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex gap-2">
            <span className="h-3 w-3 rounded-full bg-red-500" />
            <span className="h-3 w-3 rounded-full bg-yellow-400" />
            <span className="h-3 w-3 rounded-full bg-green-500" />
          </div>
          <p className="text-sm font-bold">Training Console</p>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <span
            className={`rounded-full px-3 py-1 ${
              socketState === "connected"
                ? "bg-green-900/40 text-green-400"
                : socketState === "connecting"
                  ? "bg-yellow-900/40 text-yellow-300"
                  : "bg-red-900/40 text-red-400"
            }`}
          >
            {socketState}
          </span>
        </div>
      </div>

      <div className="h-[280px] overflow-y-auto bg-[#0b0b0b] px-4 py-4 font-mono text-sm">
        {terminalLines.map((line) => (
          <div className="flex gap-3 py-1" key={line.id}>
            <span className="w-20 shrink-0 text-gray-500">{line.time}</span>
            <span className={lineToneClass(line.tone)}>{line.text}</span>
          </div>
        ))}
        <div ref={terminalBottomRef} />
      </div>
    </div>
  );
}
