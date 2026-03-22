export type User = {
  uuid: string;
  name: string;
  email: string;
  password: string;
};

export type EditorInstance = {
  getValue: () => string;
};

export type ValidationResult = {
  val: boolean;
  reason: string;
};

export type TerminalTone = "command" | "error" | "info" | "socket" | "success";

export type TerminalLine = {
  id: number;
  text: string;
  time: string;
  tone: TerminalTone;
};
