import type { Process } from "../core/process";
import type { TickContext } from "../core/tick-context";
import { getRoomMemory } from "../memory/store";
import { isV2CreepMemory } from "../memory/schema";
import * as actions from "./actions";

export class CreepExecutorProcess implements Process {
  run(_context: TickContext): void {
    for (const creep of Object.values(Game.creeps)) {
      if (creep.spawning || !isV2CreepMemory(creep.memory)) continue;
      const result = creep.memory.role === "harvester" ? this.runHarvester(creep) : this.runWorker(creep);
      if (result.kind === "completed" || result.kind === "invalid" || result.kind === "blocked") {
        creep.memory.action = undefined;
      }
    }
  }

  private runHarvester(creep: Creep): actions.ActionResult {
    const memory = getRoomMemory(creep.memory.homeRoom);
    if (creep.store.getUsedCapacity(RESOURCE_ENERGY) <= 0) {
      const sourceId = creep.memory.action?.sourceId ?? memory.sourceIds[0];
      if (!sourceId) return { kind: "blocked", reason: "no-source" };
      creep.memory.action = { kind: "harvest", sourceId, startedAt: Game.time };
      return actions.harvest(creep, sourceId);
    }

    const targetId = creep.memory.action?.targetId ?? this.findDepositTarget(creep);
    if (!targetId) return { kind: "blocked", reason: "no-deposit-target" };
    creep.memory.action = { kind: "transfer", targetId, startedAt: Game.time };
    return actions.transfer(creep, targetId);
  }

  private runWorker(creep: Creep): actions.ActionResult {
    const memory = getRoomMemory(creep.memory.homeRoom);
    if (creep.store.getUsedCapacity(RESOURCE_ENERGY) <= 0) {
      const targetId = creep.memory.action?.targetId ?? this.findWithdrawTarget(creep);
      if (!targetId) return { kind: "blocked", reason: "no-energy-source" };
      creep.memory.action = { kind: "withdraw", targetId, startedAt: Game.time };
      return actions.withdraw(creep, targetId);
    }

    const request = Object.values(memory.requests)
      .filter(request => request.amount > 0 && request.targetId)
      .sort((left, right) => right.priority - left.priority)[0];
    if (!request?.targetId) {
      if (memory.controllerId) {
        creep.memory.action = { kind: "upgrade", targetId: memory.controllerId, startedAt: Game.time };
        return actions.upgrade(creep, memory.controllerId);
      }
      return { kind: "blocked", reason: "no-request" };
    }

    creep.memory.action = {
      kind: request.kind === "build" ? "build" : request.kind === "upgrade" ? "upgrade" : "transfer",
      targetId: request.targetId,
      startedAt: Game.time,
    };
    if (request.kind === "build") return actions.build(creep, request.targetId);
    if (request.kind === "upgrade") return actions.upgrade(creep, request.targetId);
    return actions.transfer(creep, request.targetId);
  }

  private findDepositTarget(creep: Creep): string | undefined {
    const storage = creep.room.storage;
    if (storage && storage.store.getFreeCapacity(RESOURCE_ENERGY) > 0) return storage.id;

    const targets = creep.room.find(FIND_MY_STRUCTURES, {
      filter: structure =>
        (structure.structureType === STRUCTURE_SPAWN || structure.structureType === STRUCTURE_EXTENSION) &&
        (structure as AnyStoreStructure).store.getFreeCapacity(RESOURCE_ENERGY) > 0,
    }) as Array<StructureSpawn | StructureExtension>;
    return targets[0]?.id;
  }

  private findWithdrawTarget(creep: Creep): string | undefined {
    const storage = creep.room.storage;
    if (storage && storage.store.getUsedCapacity(RESOURCE_ENERGY) > 0) return storage.id;

    const containers = creep.room.find(FIND_STRUCTURES, {
      filter: structure =>
        structure.structureType === STRUCTURE_CONTAINER &&
        (structure as StructureContainer).store.getUsedCapacity(RESOURCE_ENERGY) > 0,
    }) as StructureContainer[];
    return containers[0]?.id;
  }
}
