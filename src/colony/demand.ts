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
  const hasAllContainers = sourceContainers.length === snapshot.sources.length && snapshot.sources.length > 0;
  const constructionLoad = snapshot.constructionSites.length + snapshot.damagedStructureIds.length;
  const workers = hasAllContainers ? Math.min(2, Math.max(1, constructionLoad > 2 ? 2 : 1)) : 0;

  if (!hasAllContainers) {
    const harvestSlots = snapshot.sources.flatMap(source => source.harvestPositions.map(position => ({
      sourceId: source.id,
      ...position,
    })));
    return [{ role: "pioneer", count: harvestSlots.length, harvestSlots }];
  }

  const storage = snapshot.stores.find(store => store.structureType === STRUCTURE_STORAGE);
  const averageRoundTrip = sourceContainers.reduce((total, source) => {
    const origin = snapshot.stores.find(store => store.structureType === STRUCTURE_SPAWN) ?? storage;
    return total + (origin ? 2 * Math.max(Math.abs(origin.x - source.x), Math.abs(origin.y - source.y)) : 10);
  }, 0) / Math.max(1, sourceContainers.length);
  const sourceIncome = sourceContainers.reduce((total, source) => total + source.energyCapacity / ENERGY_REGEN_TIME, 0);
  const carryPartsNeeded = Math.max(2, Math.ceil((sourceIncome * averageRoundTrip) / CARRY_CAPACITY));
  const haulerCount = Math.max(1, Math.ceil(carryPartsNeeded / 4));

  return [
    { role: "miner", count: sourceContainers.length, sourceIds: sourceContainers.map(source => source.id) },
    { role: "hauler", count: haulerCount },
    { role: "worker", count: workers },
  ];
}
