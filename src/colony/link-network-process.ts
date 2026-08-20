import type { Process } from "../core/process";
import type { TickContext } from "../core/tick-context";

export class LinkNetworkProcess implements Process {
  run(context: TickContext): void {
    for (const snapshot of context.snapshots.values()) {
      const memory = context.colony(snapshot.roomName);
      const storage = snapshot.stores.find(store => store.structureType === STRUCTURE_STORAGE);
      if (!storage) continue;
      const sourceLinkIds = new Set(Object.values(memory.sources).map(source => source.linkId).filter(Boolean));
      const sinkId = snapshot.stores
        .filter(store => store.structureType === STRUCTURE_LINK && !sourceLinkIds.has(store.id))
        .sort((left, right) => Math.max(Math.abs(left.x - storage.x), Math.abs(left.y - storage.y)) - Math.max(Math.abs(right.x - storage.x), Math.abs(right.y - storage.y)))[0]?.id;
      if (!sinkId) continue;

      const sink = Game.getObjectById(sinkId as Id<StructureLink>);
      if (!sink || sink.store.getFreeCapacity(RESOURCE_ENERGY) <= 0) continue;
      for (const sourceId of sourceLinkIds) {
        const source = Game.getObjectById(sourceId as Id<StructureLink>);
        if (source && source.store.getUsedCapacity(RESOURCE_ENERGY) > 0) {
          source.transferEnergy(sink);
          break;
        }
      }
    }
  }
}
