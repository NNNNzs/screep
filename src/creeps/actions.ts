export type ActionResult =
  | { kind: "running" }
  | { kind: "completed" }
  | { kind: "blocked"; reason: string }
  | { kind: "invalid"; reason: string };

export function objectById<T>(id: string): T | null {
  return Game.getObjectById(id as Id<any>) as T | null;
}

function moveOr(result: number, creep: Creep, target: RoomObject): ActionResult {
  if (result === OK) return { kind: "running" };
  if (result === ERR_NOT_IN_RANGE) {
    creep.moveTo(target, { reusePath: 5 });
    return { kind: "running" };
  }
  if (result === ERR_FULL || result === ERR_NOT_ENOUGH_RESOURCES) return { kind: "completed" };
  return { kind: "blocked", reason: `code:${result}` };
}

export function moveToPosition(creep: Creep, position: RoomPosition): ActionResult {
  if (creep.pos.isEqualTo(position)) return { kind: "completed" };
  creep.moveTo(position, { reusePath: 10 });
  return { kind: "running" };
}

export function harvest(creep: Creep, sourceId: string): ActionResult {
  const source = objectById<Source>(sourceId);
  if (!source) return { kind: "invalid", reason: "source-missing" };
  if (creep.store.getFreeCapacity(RESOURCE_ENERGY) <= 0) return { kind: "completed" };
  return moveOr(creep.harvest(source), creep, source);
}

export function withdraw(creep: Creep, targetId: string): ActionResult {
  const target = objectById<AnyStoreStructure>(targetId);
  if (!target) return { kind: "invalid", reason: "withdraw-target-missing" };
  if (creep.store.getFreeCapacity(RESOURCE_ENERGY) <= 0) return { kind: "completed" };
  return moveOr(creep.withdraw(target, RESOURCE_ENERGY), creep, target);
}

export function transfer(creep: Creep, targetId: string): ActionResult {
  const target = objectById<AnyStoreStructure>(targetId);
  if (!target) return { kind: "invalid", reason: "transfer-target-missing" };
  if (creep.store.getUsedCapacity(RESOURCE_ENERGY) <= 0) return { kind: "completed" };
  return moveOr(creep.transfer(target, RESOURCE_ENERGY), creep, target);
}

export function build(creep: Creep, siteId: string): ActionResult {
  const site = objectById<ConstructionSite>(siteId);
  if (!site) return { kind: "invalid", reason: "construction-site-missing" };
  if (creep.store.getUsedCapacity(RESOURCE_ENERGY) <= 0) return { kind: "completed" };
  return moveOr(creep.build(site), creep, site);
}

export function repair(creep: Creep, targetId: string): ActionResult {
  const target = objectById<AnyStructure>(targetId);
  if (!target) return { kind: "invalid", reason: "repair-target-missing" };
  if (creep.store.getUsedCapacity(RESOURCE_ENERGY) <= 0) return { kind: "completed" };
  return moveOr(creep.repair(target), creep, target);
}

export function upgrade(creep: Creep, controllerId: string): ActionResult {
  const controller = objectById<StructureController>(controllerId);
  if (!controller) return { kind: "invalid", reason: "controller-missing" };
  if (creep.store.getUsedCapacity(RESOURCE_ENERGY) <= 0) return { kind: "completed" };
  return moveOr(creep.upgradeController(controller), creep, controller);
}
