import type { Process, ProcessOptions, ProcessPriority, RegisteredProcess } from "./process";
import type { TickContext } from "./tick-context";

const PRIORITY_ORDER: Record<ProcessPriority, number> = {
  always: 0,
  high: 1,
  normal: 2,
  low: 3,
};

export class Scheduler {
  private readonly processes: RegisteredProcess[] = [];
  private readonly lastRun = new Map<string, number>();

  register(process: Process, options: ProcessOptions): void {
    this.processes.push({
      process,
      id: options.id,
      interval: options.interval ?? 1,
      priority: options.priority ?? "normal",
      minBucket: options.minBucket ?? 0,
      requireSegments: options.requireSegments ?? false,
      maxCpu: options.maxCpu,
    });
  }

  run(context: TickContext): void {
    const ordered = this.processes
      .map((definition, index) => ({ definition, index }))
      .sort((left, right) => PRIORITY_ORDER[left.definition.priority] - PRIORITY_ORDER[right.definition.priority] || left.index - right.index)
      .map(item => item.definition);

    for (const definition of ordered) {
      const previous = this.lastRun.get(definition.id);
      if (previous !== undefined && Game.time - previous < definition.interval) continue;

      const stats = (context.botMemory.kernel.processes[definition.id] ??= {
        runs: 0,
        skipped: 0,
        cpu: 0,
      });

      if (Game.cpu.bucket < definition.minBucket) {
        stats.skipped += 1;
        continue;
      }
      if (definition.requireSegments && !RawMemory.segments) {
        stats.skipped += 1;
        continue;
      }
      if (Game.cpu.getUsed() >= Game.cpu.tickLimit) {
        stats.skipped += 1;
        continue;
      }

      const started = Game.cpu.getUsed();
      this.lastRun.set(definition.id, Game.time);
      try {
        definition.process.run(context);
        stats.runs += 1;
      } catch (error) {
        stats.lastError = error instanceof Error ? error.stack || error.message : String(error);
        context.botMemory.kernel.lastError = `${definition.id}: ${stats.lastError}`;
      } finally {
        stats.cpu += Math.max(0, Game.cpu.getUsed() - started);
        stats.lastRun = Game.time;
      }
    }
  }
}
