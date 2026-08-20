import type { HarvestPosition } from "./room-snapshot";

/**
 * Returns walkable tiles adjacent to a Source. These are current-tick facts:
 * callers may persist an assigned coordinate in creep Memory, but not this list.
 */
export function findHarvestPositions(room: Room, source: Source): HarvestPosition[] {
  const terrain = room.getTerrain();
  const positions: HarvestPosition[] = [];
  for (let dx = -1; dx <= 1; dx += 1) {
    for (let dy = -1; dy <= 1; dy += 1) {
      if (dx === 0 && dy === 0) continue;
      const x = source.pos.x + dx;
      const y = source.pos.y + dy;
      if (x <= 0 || x >= 49 || y <= 0 || y >= 49 || terrain.get(x, y) === TERRAIN_MASK_WALL) continue;
      const blocked = room.lookForAt(LOOK_STRUCTURES, x, y).some(structure =>
        structure.structureType !== STRUCTURE_CONTAINER && structure.structureType !== STRUCTURE_ROAD && structure.structureType !== STRUCTURE_RAMPART,
      );
      if (!blocked) positions.push({ x, y });
    }
  }
  return positions;
}
