import type { HarvestPosition, RoomSnapshot } from "../world/room-snapshot";

export interface PioneerHarvestSlot extends HarvestPosition {
  sourceId: string;
}

export interface RoleDemand {
  role: BotRole;
  count: number;
  sourceIds?: string[];
  harvestSlots?: PioneerHarvestSlot[];
}

export function buildRoleDemand(snapshot: RoomSnapshot): RoleDemand[] {
  const sourceContainers = snapshot.sources.filter(source => source.containerId);
  const sourcesWithoutContainers = snapshot.sources.filter(source => !source.containerId);
  const constructionLoad = snapshot.constructionSites.length + snapshot.damagedStructureIds.length;
  const workers = sourceContainers.length > 0 ? Math.min(2, Math.max(1, constructionLoad)) : 0;
  const demands: RoleDemand[] = [];

  if (sourcesWithoutContainers.length > 0) {
    const spawn = snapshot.stores.find(store => store.structureType === STRUCTURE_SPAWN);
    const harvestSlots = sourcesWithoutContainers
      .flatMap(source => source.harvestPositions.map(position => ({ sourceId: source.id, ...position })))
      .sort((left, right) => {
        if (!spawn) return left.sourceId.localeCompare(right.sourceId) || left.x - right.x || left.y - right.y;
        const leftDistance = Math.max(Math.abs(left.x - spawn.x), Math.abs(left.y - spawn.y));
        const rightDistance = Math.max(Math.abs(right.x - spawn.x), Math.abs(right.y - spawn.y));
        return leftDistance - rightDistance || left.sourceId.localeCompare(right.sourceId) || left.x - right.x || left.y - right.y;
      });
    demands.push({ role: "pioneer", count: harvestSlots.length, harvestSlots });
  }

  if (sourceContainers.length === 0) return demands;
  const storage = snapshot.stores.find(store => store.structureType === STRUCTURE_STORAGE);
  const averageRoundTrip = sourceContainers.reduce((total, source) => {
    const origin = snapshot.stores.find(store => store.structureType === STRUCTURE_SPAWN) ?? storage;
    return total + (origin ? 2 * Math.max(Math.abs(origin.x - source.x), Math.abs(origin.y - source.y)) : 10);
  }, 0) / Math.max(1, sourceContainers.length);
  const sourceIncome = sourceContainers.reduce((total, source) => total + source.energyCapacity / ENERGY_REGEN_TIME, 0);
  const carryPartsNeeded = Math.max(2, Math.ceil((sourceIncome * averageRoundTrip) / CARRY_CAPACITY));
  const haulerCount = Math.max(1, Math.ceil(carryPartsNeeded / 4));

  demands.push(
    { role: "miner", count: sourceContainers.length, sourceIds: sourceContainers.map(source => source.id) },
    { role: "hauler", count: haulerCount },
    { role: "worker", count: workers },
    { role: "upgrader", count: 1 },
  );
  return demands;
}
