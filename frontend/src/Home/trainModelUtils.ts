import type { TerminalTone } from "./trainModelTypes";

export const initialTerminalMessage =
  'Ready. Upload Python files and click "Train Model" to start.';

export function timestamp() {
  const now = new Date();
  const year = now.getFullYear();
  // Add 1 to getMonth() because it is zero-based (January = 0)
  const month = now.getMonth() + 1;
  const day = now.getDate();
  const hours = now.getHours();
  const minutes = now.getMinutes();

  // console.log(`${year}-${month}-${day} ${hours}:${minutes}`);


  // console.log(
  //   "timestamp",
  //   new Date().toLocaleTimeString([], {
  //     hour: "2-digit",
  //     minute: "2-digit",
  //     second: "2-digit",
  //   }),
  // );

  return `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;
}

export function lineToneClass(tone: TerminalTone) {
  if (tone === "success") {
    return "text-green-400";
  }
  if (tone === "error") {
    return "text-red-400";
  }
  if (tone === "command") {
    return "text-yellow-300";
  }
  if (tone === "socket") {
    return "text-cyan-300";
  }
  return "text-gray-200";
}
