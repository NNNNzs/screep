import { ColonyProcess } from "../colony/colony-process";
import { DefenseProcess } from "../colony/defense-process";
import { LinkNetworkProcess } from "../colony/link-network-process";
import { SpawnProcess } from "../colony/spawn-process";
import { CreepExecutorProcess } from "../creeps/executor";
import { cleanupDeadCreepMemory, ensureBotMemory } from "../memory/store";
import { RoomObserverProcess } from "../world/room-observer";
import { Scheduler } from "./scheduler";
import { createTickContext } from "./tick-context";

export class Kernel {
  readonly scheduler = new Scheduler();

  constructor() {
    this.scheduler.register(new RoomObserverProcess(), { id: "world.observe", priority: "always" });
    this.scheduler.register(new ColonyProcess(), { id: "colony.plan", priority: "always" });
    this.scheduler.register(new LinkNetworkProcess(), { id: "colony.links", priority: "always" });
    this.scheduler.register(new SpawnProcess(), { id: "spawn.manage", priority: "always" });
    this.scheduler.register(new DefenseProcess(), { id: "defense", priority: "always" });
    this.scheduler.register(new CreepExecutorProcess(), { id: "creeps.execute", priority: "always" });
  }

  run(): void {
    const botMemory = ensureBotMemory();
    cleanupDeadCreepMemory();
    if (!botMemory.settings.enabled) return;
    this.scheduler.run(createTickContext(botMemory, this.scheduler));
  }
}

export function createKernel(): Kernel { return new Kernel(); }
