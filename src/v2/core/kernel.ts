import { ensureBotMemory, cleanupDeadCreepMemory } from "../memory/store";
import { Scheduler } from "./scheduler";
import { createTickContext } from "./tick-context";
import { RoomObserverProcess } from "../world/observer/room-observer";
import { EmpireProcess } from "../empire/empire-process";
import { ColonyProcess } from "../empire/colony-process";
import { SpawnProcess } from "../empire/spawn-process";
import { DefenseProcess } from "../empire/defense-process";
import { CreepExecutorProcess } from "../creeps/executor";

export class Kernel {
  readonly scheduler = new Scheduler();

  constructor() {
    this.scheduler.register(new DefenseProcess(), {
      id: "defense",
      priority: "always",
      interval: 1,
      maxCpu: 2,
    });
    this.scheduler.register(new CreepExecutorProcess(), {
      id: "creeps.execute",
      priority: "always",
      interval: 1,
      maxCpu: 10,
    });
    this.scheduler.register(new RoomObserverProcess(), {
      id: "world.observe",
      priority: "high",
      interval: 5,
      maxCpu: 5,
    });
    this.scheduler.register(new EmpireProcess(), {
      id: "empire.refresh",
      priority: "high",
      interval: 5,
      maxCpu: 2,
    });
    this.scheduler.register(new ColonyProcess(), {
      id: "colony.plan",
      priority: "high",
      interval: 3,
      maxCpu: 5,
    });
    this.scheduler.register(new SpawnProcess(), {
      id: "spawn.manage",
      priority: "high",
      interval: 3,
      maxCpu: 3,
    });
  }

  run(): void {
    const botMemory = ensureBotMemory();
    cleanupDeadCreepMemory();
    const context = createTickContext(botMemory, this.scheduler);
    this.scheduler.run(context);
  }
}

export function createKernel(): Kernel {
  return new Kernel();
}
