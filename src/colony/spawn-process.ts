import type { Process } from "../core/process";
import type { TickContext } from "../core/tick-context";
import { createCreepMemory, isBotCreepMemory } from "../memory/schema";
import { buildRoleDemand, type RoleDemand } from "./demand";
import type { RoomSnapshot } from "../world/room-snapshot";

interface SpawnRequest { role: BotRole; sourceId?: string; harvestPosition?: { x: number; y: number }; reason: string; }

const MIN_SPAWN_RESERVE = 100;

function pioneerSlotKey(sourceId: string, position: { x: number; y: number }): string {
  return `${sourceId}:${position.x}:${position.y}`;
}

function bodyCost(body: BodyPartConstant[]): number {
  return body.reduce((total, part) => total + BODYPART_COST[part], 0);
}

function addPattern(body: BodyPartConstant[], pattern: BodyPartConstant[], energy: number): void {
  while (body.length + pattern.length <= MAX_CREEP_SIZE && bodyCost([...body, ...pattern]) <= energy) body.push(...pattern);
}

function buildBody(role: BotRole, energy: number): BodyPartConstant[] | undefined {
  const body: BodyPartConstant[] = [];
  if (role === "miner") {
    body.push(WORK, CARRY, MOVE);
    while (body.filter(part => part === WORK).length < 5 && bodyCost([...body, WORK]) <= energy) body.push(WORK);
  } else if (role === "hauler") {
    addPattern(body, [CARRY, CARRY, MOVE], energy);
  } else {
    addPattern(body, [WORK, CARRY, MOVE], energy);
  }
  return body.length > 0 && bodyCost(body) <= energy ? body : undefined;
}

function activeCreeps(roomName: string): Creep[] {
  return Object.values(Game.creeps).filter(creep =>
    !creep.spawning && isBotCreepMemory(creep.memory) && creep.memory.homeRoom === roomName,
  );
}

function nextRequest(roomName: string, demand: RoleDemand[]): SpawnRequest | undefined {
  const creeps = activeCreeps(roomName);
  const count = (role: BotRole) => creeps.filter(creep => creep.memory.role === role).length;
  const pioneer = demand.find(item => item.role === "pioneer");
  const pioneerSlotKeys = new Set(creeps
    .filter(creep => creep.memory.role === "pioneer" && creep.memory.sourceId && creep.memory.harvestPosition)
    .map(creep => pioneerSlotKey(creep.memory.sourceId as string, creep.memory.harvestPosition as { x: number; y: number })));
  const hasUnboundPioneer = creeps.some(creep =>
    creep.memory.role === "pioneer" && !creep.memory.harvestPosition &&
    (!creep.memory.sourceId || pioneer?.harvestSlots?.some(slot => slot.sourceId === creep.memory.sourceId)),
  );
  const pioneerSlot = pioneer?.harvestSlots?.find(slot => !pioneerSlotKeys.has(pioneerSlotKey(slot.sourceId, slot)));
  if (pioneer && !hasUnboundPioneer && pioneerSlot) {
    return { role: "pioneer", sourceId: pioneerSlot.sourceId, harvestPosition: pioneerSlot, reason: "bootstrap-harvest-slot" };
  }

  const miner = demand.find(item => item.role === "miner");
  const assigned = new Set(creeps.filter(creep => creep.memory.role === "miner").map(creep => creep.memory.sourceId).filter(Boolean));
  const sourceId = miner?.sourceIds?.find(id => !assigned.has(id));
  if (sourceId) return { role: "miner", sourceId, reason: "source-container" };

  const hauler = demand.find(item => item.role === "hauler");
  if (hauler && count("hauler") < hauler.count) return { role: "hauler", reason: "haul-capacity" };

  const worker = demand.find(item => item.role === "worker");
  if (worker && count("worker") < worker.count) return { role: "worker", reason: "work-demand" };
  const upgrader = demand.find(item => item.role === "upgrader");
  if (upgrader && count("upgrader") < upgrader.count) return { role: "upgrader", reason: "controller-upgrade" };
  return undefined;
}

function emergencyBootstrapRequest(snapshot: RoomSnapshot): SpawnRequest | undefined {
  const source = snapshot.sources.find(candidate => !candidate.containerId) ?? snapshot.sources[0];
  if (!source) return undefined;
  const position = source.harvestPositions[0];
  return {
    role: source.containerId ? "miner" : "pioneer",
    sourceId: source.id,
    harvestPosition: position,
    reason: "emergency-bootstrap",
  };
}

export class SpawnProcess implements Process {
  run(context: TickContext): void {
    for (const snapshot of context.snapshots.values()) {
      const room = Game.rooms[snapshot.roomName];
      const spawn = room?.find(FIND_MY_SPAWNS).find(candidate => !candidate.spawning);
      if (!room || !spawn) continue;

      const creeps = activeCreeps(room.name);
      const request = nextRequest(room.name, buildRoleDemand(snapshot))
        ?? (creeps.length === 0 ? emergencyBootstrapRequest(snapshot) : undefined);
      if (!request) continue;
      const hasPopulation = creeps.length > 0;
      const bodyBudget = hasPopulation
        ? Math.max(0, room.energyCapacityAvailable - MIN_SPAWN_RESERVE)
        : room.energyAvailable;
      const body = buildBody(request.role, bodyBudget);
      if (!body) continue;
      const cost = bodyCost(body);
      const reserve = hasPopulation ? MIN_SPAWN_RESERVE : 0;
      if (room.energyAvailable < cost + reserve) continue;

      const name = `${request.role}-${room.name.replace(/[^a-zA-Z0-9]/g, "")}-${Game.time}`;
      spawn.spawnCreep(body, name, { memory: createCreepMemory(request.role, room.name, request.sourceId, request.harvestPosition) });
    }
  }
}
