import type { TickContext } from "./tick-context";

export type ProcessPriority = "always" | "high" | "normal" | "low";

export interface ProcessOptions {
  id: string;
  interval?: number;
  priority?: ProcessPriority;
  minBucket?: number;
  requireSegments?: boolean;
  maxCpu?: number;
}

export interface Process {
  run(context: TickContext): void;
}

export interface RegisteredProcess extends Required<Omit<ProcessOptions, "maxCpu">> {
  maxCpu?: number;
  process: Process;
}
