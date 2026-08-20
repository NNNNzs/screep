import type { Process } from "../core/process";
import type { TickContext } from "../core/tick-context";
import { isBotCreepMemory } from "../memory/schema";
import { releaseRequest } from "../memory/store";
import { findHarvestPositions } from "../world/harvest-slots";
import * as actions from "./actions";

function setAction(creep: Creep, action: BotActionMemory): void {
  creep.memory.action = action;
}

function clearAction(creep: Creep): void {
  releaseRequest(creep);
  creep.memory.action = undefined;
}

function reserveRequest(creep: Creep, request: RoomRequestMemory): void {
  if (!request.assignedCreeps.includes(creep.name)) request.assignedCreeps.push(creep.name);
}

function selectRequest(creep: Creep, memory: ColonyMemory, kinds: RequestKind[]): RoomRequestMemory | undefined {
  return Object.values(memory.requests)
    .filter(request => request.amount > 0 && kinds.includes(request.kind))
    .filter(request => request.kind === "refill" || request.assignedCreeps.length === 0 || request.assignedCreeps.includes(creep.name))
    .sort((left, right) => right.priority - left.priority || left.assignedCreeps.length - right.assignedCreeps.length)[0];
}

function executeRequest(creep: Creep, request: RoomRequestMemory): actions.ActionResult {
  if (creep.memory.action?.requestId && creep.memory.action.requestId !== request.id) releaseRequest(creep);
  reserveRequest(creep, request);
  const action: BotActionMemory = {
    kind: request.kind === "refill" ? "transfer" : request.kind,
    targetId: request.targetId,
    requestId: request.id,
    startedAt: Game.time,
  };
  setAction(creep, action);
  if (request.kind === "refill") return actions.transfer(creep, request.targetId);
  if (request.kind === "build") return actions.build(creep, request.targetId);
  if (request.kind === "repair") return actions.repair(creep, request.targetId);
  return actions.upgrade(creep, request.targetId);
}

function sourceContainerBuildRequest(creep: Creep, memory: ColonyMemory): RoomRequestMemory | undefined {
  const sourceId = creep.memory.sourceId;
  const source = sourceId ? memory.sources[sourceId] : undefined;
  if (!source) return undefined;

  return Object.values(memory.requests)
    .filter(request => request.kind === "build" && request.amount > 0)
    .filter(request => {
      const site = actions.objectById<ConstructionSite>(request.targetId);
      return site?.structureType === STRUCTURE_CONTAINER && Math.max(Math.abs(site.pos.x - source.x), Math.abs(site.pos.y - source.y)) <= 1;
    })
    .sort((left, right) => left.id.localeCompare(right.id))[0];
}

function energyProvider(creep: Creep, memory: ColonyMemory, preferStorage: boolean): AnyStoreStructure | undefined {
  const storage = memory.storageId ? actions.objectById<AnyStoreStructure>(memory.storageId) : undefined;
  if (preferStorage && storage?.store.getUsedCapacity(RESOURCE_ENERGY)) return storage;

  const containers: AnyStoreStructure[] = [];
  for (const source of Object.values(memory.sources)) {
    if (!source.containerId) continue;
    const container = actions.objectById<StructureContainer>(source.containerId);
    if (container?.store.getUsedCapacity(RESOURCE_ENERGY)) containers.push(container);
  }
  const container = containers.sort((left, right) => preferStorage
    ? creep.pos.getRangeTo(left) - creep.pos.getRangeTo(right)
    : right.store.getUsedCapacity(RESOURCE_ENERGY) - left.store.getUsedCapacity(RESOURCE_ENERGY) || creep.pos.getRangeTo(left) - creep.pos.getRangeTo(right),
  )[0];
  return container ?? (storage?.store.getUsedCapacity(RESOURCE_ENERGY) ? storage : undefined);
}

export class CreepExecutorProcess implements Process {
  run(context: TickContext): void {
    for (const creep of Object.values(Game.creeps)) {
      if (creep.spawning || !isBotCreepMemory(creep.memory)) continue;
      const result = this.runCreep(creep, context.colony(creep.memory.homeRoom));
      if (result.kind === "completed" || result.kind === "invalid" || result.kind === "blocked") clearAction(creep);
    }
  }

  private runCreep(creep: Creep, memory: ColonyMemory): actions.ActionResult {
    if (creep.memory.role === "miner") return this.runMiner(creep, memory);
    if (creep.memory.role === "hauler") return this.runHauler(creep, memory);
    if (creep.memory.role === "upgrader") return this.runUpgrader(creep, memory);
    if (creep.memory.role === "worker") return this.runWorker(creep, memory);
    return this.runPioneer(creep, memory);
  }

  private runMiner(creep: Creep, memory: ColonyMemory): actions.ActionResult {
    const sourceId = creep.memory.sourceId;
    const source = sourceId ? memory.sources[sourceId] : undefined;
    if (!source?.containerId) return this.runPioneer(creep, memory);
    const container = actions.objectById<StructureContainer>(source.containerId);
    if (!container) return { kind: "invalid", reason: "source-container-missing" };
    if (!creep.pos.isEqualTo(container.pos)) return actions.moveToPosition(creep, container.pos);

    const link = source.linkId ? actions.objectById<StructureLink>(source.linkId) : undefined;
    const linkAvailable = Boolean(link?.store.getFreeCapacity(RESOURCE_ENERGY));
    const containerAvailable = container.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
    if (creep.store.getFreeCapacity(RESOURCE_ENERGY) > 0 && (containerAvailable || linkAvailable)) {
      setAction(creep, { kind: "harvest", sourceId, startedAt: Game.time });
      return actions.harvest(creep, sourceId);
    }
    if (creep.store.getUsedCapacity(RESOURCE_ENERGY) <= 0) {
      return { kind: "blocked", reason: "source-buffer-full" };
    }
    const targetId = linkAvailable ? link?.id : container.id;
    if (!targetId) return { kind: "blocked", reason: "source-buffer-full" };
    setAction(creep, { kind: "transfer", targetId, sourceId, startedAt: Game.time });
    return actions.transfer(creep, targetId);
  }

  private runHauler(creep: Creep, memory: ColonyMemory): actions.ActionResult {
    if (creep.store.getUsedCapacity(RESOURCE_ENERGY) <= 0) {
      const provider = energyProvider(creep, memory, false);
      if (!provider) return { kind: "blocked", reason: "no-haul-provider" };
      setAction(creep, { kind: "withdraw", targetId: provider.id, startedAt: Game.time });
      return actions.withdraw(creep, provider.id);
    }
    const request = selectRequest(creep, memory, ["refill"]);
    if (request) return executeRequest(creep, request);
    const storage = memory.storageId ? actions.objectById<StructureStorage>(memory.storageId) : undefined;
    if (storage?.store.getFreeCapacity(RESOURCE_ENERGY)) {
      setAction(creep, { kind: "transfer", targetId: storage.id, startedAt: Game.time });
      return actions.transfer(creep, storage.id);
    }
    return { kind: "blocked", reason: "no-haul-target" };
  }

  private runWorker(creep: Creep, memory: ColonyMemory): actions.ActionResult {
    if (creep.store.getUsedCapacity(RESOURCE_ENERGY) <= 0) {
      const provider = energyProvider(creep, memory, true);
      if (!provider) return { kind: "blocked", reason: "no-work-provider" };
      setAction(creep, { kind: "withdraw", targetId: provider.id, startedAt: Game.time });
      return actions.withdraw(creep, provider.id);
    }
    const request = selectRequest(creep, memory, ["refill", "build", "repair"]);
    if (request) return executeRequest(creep, request);
    return { kind: "blocked", reason: "no-work-request" };
  }

  private runUpgrader(creep: Creep, memory: ColonyMemory): actions.ActionResult {
    if (creep.store.getUsedCapacity(RESOURCE_ENERGY) <= 0) {
      const provider = energyProvider(creep, memory, true);
      if (!provider) return { kind: "blocked", reason: "no-upgrade-provider" };
      setAction(creep, { kind: "withdraw", targetId: provider.id, startedAt: Game.time });
      return actions.withdraw(creep, provider.id);
    }
    const request = selectRequest(creep, memory, ["refill", "upgrade"]);
    if (request) return executeRequest(creep, request);
    return { kind: "blocked", reason: "no-upgrade-request" };
  }

  private runPioneer(creep: Creep, memory: ColonyMemory): actions.ActionResult {
    const claimedSlots = new Set(Object.values(Game.creeps)
      .filter(candidate => isBotCreepMemory(candidate.memory) && candidate.memory.homeRoom === creep.memory.homeRoom && candidate.memory.role === "pioneer")
      .filter(candidate => candidate.name !== creep.name && candidate.memory.sourceId && candidate.memory.harvestPosition)
      .map(candidate => `${candidate.memory.sourceId}:${candidate.memory.harvestPosition?.x}:${candidate.memory.harvestPosition?.y}`)
      .filter(Boolean));
    const sourceId = creep.memory.sourceId ?? Object.values(memory.sources).find(source => actions.objectById<Source>(source.id))?.id;
    const source = sourceId ? actions.objectById<Source>(sourceId) : undefined;
    if (!source) return { kind: "invalid", reason: "bootstrap-source-missing" };
    if (!creep.memory.sourceId) creep.memory.sourceId = source.id;
    if (!creep.memory.harvestPosition) {
      const position = findHarvestPositions(source.room, source)
        .filter(candidate => !claimedSlots.has(`${source.id}:${candidate.x}:${candidate.y}`))
        .sort((left, right) => creep.pos.getRangeTo(left.x, left.y) - creep.pos.getRangeTo(right.x, right.y) || left.x - right.x || left.y - right.y)[0];
      if (position) creep.memory.harvestPosition = position;
    }
    const currentBuildRequest = creep.memory.action?.requestId
      ? memory.requests[creep.memory.action.requestId]
      : undefined;
    if (currentBuildRequest?.kind === "build" && currentBuildRequest.amount > 0) {
      return executeRequest(creep, currentBuildRequest);
    }
    if (source && source.energy > 0 && creep.store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
      const position = creep.memory.harvestPosition;
      if (position && !creep.pos.isEqualTo(position.x, position.y)) {
        return actions.moveToPosition(creep, new RoomPosition(position.x, position.y, source.room.name));
      }
      setAction(creep, { kind: "harvest", sourceId, startedAt: Game.time });
      return actions.harvest(creep, sourceId);
    }

    if (creep.store.getUsedCapacity(RESOURCE_ENERGY) <= 0) return { kind: "blocked", reason: "no-bootstrap-source" };
    const urgentRefill = selectRequest(creep, memory, ["refill"]);
    if (urgentRefill) return executeRequest(creep, urgentRefill);
    const sourceContainer = sourceContainerBuildRequest(creep, memory);
    if (sourceContainer) return executeRequest(creep, sourceContainer);
    const request = selectRequest(creep, memory, ["refill", "build", "repair", "upgrade"]);
    if (request) return executeRequest(creep, request);
    return { kind: "blocked", reason: "no-bootstrap-request" };
  }
}
