import type { Process } from "../core/process";
import type { TickContext } from "../core/tick-context";
import { createV2CreepMemory, isV2CreepMemory } from "../memory/schema";

const ROLE_ORDER: V2Role[] = ["harvester", "carrier", "worker"];

const BODY_PATTERNS: Record<V2Role, BodyPartConstant[]> = {
  harvester: [WORK, CARRY, MOVE],
  carrier: [CARRY, CARRY, MOVE],
  worker: [WORK, CARRY, MOVE],
};

function bodyCost(body: BodyPartConstant[]): number {
  return body.reduce((total, part) => total + BODYPART_COST[part], 0);
}

function buildBody(role: V2Role, energy: number): BodyPartConstant[] | undefined {
  const pattern = BODY_PATTERNS[role];
  const body: BodyPartConstant[] = [];
  while (body.length + pattern.length <= MAX_CREEP_SIZE && bodyCost([...body, ...pattern]) <= energy) {
    body.push(...pattern);
  }
  return body.length > 0 ? body : undefined;
}

export class SpawnProcess implements Process {
  run(context: TickContext): void {
    for (const roomName of context.botMemory.empire.ownedRooms) {
      const room = Game.rooms[roomName];
      if (!room?.controller?.my) continue;

      const spawn = room.find(FIND_MY_SPAWNS).find(candidate => !candidate.spawning);
      if (!spawn) continue;

      const sources = context.room(roomName).sourceIds;
      const counts = this.countRoles(roomName);
      const desired: Record<V2Role, number> = {
        harvester: Math.max(1, sources.length),
        carrier: sources.length > 0 && room.storage ? 1 : 0,
        worker: 1,
      };
      const role = ROLE_ORDER.find(candidate => counts[candidate] < desired[candidate]);
      if (!role) continue;

      const body = buildBody(role, room.energyAvailable);
      if (!body) continue;

      const sourceId = role === "harvester" ? sources[counts.harvester % Math.max(1, sources.length)] : undefined;
      const name = `v2-${role}-${roomName.replace(/[^a-zA-Z0-9]/g, "")}-${Game.time}`;
      spawn.spawnCreep(body, name, { memory: createV2CreepMemory(role, roomName, sourceId) });
    }
  }

  private countRoles(roomName: string): Record<V2Role, number> {
    const counts: Record<V2Role, number> = { harvester: 0, carrier: 0, worker: 0 };
    for (const creep of Object.values(Game.creeps)) {
      if (!isV2CreepMemory(creep.memory) || creep.memory.homeRoom !== roomName) continue;
      counts[creep.memory.role] += 1;
    }
    return counts;
  }
}
