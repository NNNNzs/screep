export enum TaskType {
  Harvest = 'harvest',
  Transfer = 'transfer',
  Upgrade = 'upgrade',
  Build = 'build',
  Repair = 'repair',
  Idle = 'idle'
}

export interface Task {
  type: TaskType;
  target?: Id<any>;
  data?: any;
}

export class TaskManager {
  private static tasks: Map<Id<Creep>, Task> = new Map();

  static assignTask(creep: Creep, task: Task): void {
    this.tasks.set(creep.id, task);
  }

  static getTask(creep: Creep): Task | undefined {
    return this.tasks.get(creep.id);
  }

  static clearTask(creep: Creep): void {
    this.tasks.delete(creep.id);
  }

  static runTasks(): void {
    for (const [creepId, task] of this.tasks) {
      const creep = Game.getObjectById(creepId);
      if (!creep) {
        this.tasks.delete(creepId);
        continue;
      }

      switch (task.type) {
        case TaskType.Harvest:
          this.runHarvestTask(creep, task);
          break;
        case TaskType.Transfer:
          this.runTransferTask(creep, task);
          break;
        case TaskType.Upgrade:
          this.runUpgradeTask(creep, task);
          break;
        case TaskType.Build:
          this.runBuildTask(creep, task);
          break;
        case TaskType.Repair:
          this.runRepairTask(creep, task);
          break;
        case TaskType.Idle:
          // Do nothing for idle task
          break;
      }
    }
  }

  private static moveToTarget(creep: Creep, target: RoomPosition | { pos: RoomPosition }): boolean {
    const targetPos = target instanceof RoomPosition ? target : target.pos;
    if (creep.pos.isNearTo(targetPos)) {
      return true;
    }
    creep.moveTo(targetPos);
    return false;
  }

  private static runHarvestTask(creep: Creep, task: Task): void {
    const source = Game.getObjectById<Source>(task.target as Id<Source>);
    if (source) {
      if (this.moveToTarget(creep, source)) {
        creep.harvest(source);
      }
    }
  }

  private static runTransferTask(creep: Creep, task: Task): void {
    const target = Game.getObjectById<Structure>(task.target as Id<Structure>);
    if (target) {
      if (this.moveToTarget(creep, target)) {
        creep.transfer(target, task.data.resourceType, task.data.amount);
      }
    }
  }

  private static runUpgradeTask(creep: Creep, task: Task): void {
    const controller = creep.room.controller;
    if (controller) {
      if (this.moveToTarget(creep, controller)) {
        creep.upgradeController(controller);
      }
    }
  }

  private static runBuildTask(creep: Creep, task: Task): void {
    const target = Game.getObjectById<ConstructionSite>(task.target as Id<ConstructionSite>);
    if (target) {
      if (this.moveToTarget(creep, target)) {
        creep.build(target);
      }
    }
  }

  private static runRepairTask(creep: Creep, task: Task): void {
    const target = Game.getObjectById<Structure>(task.target as Id<Structure>);
    if (target) {
      if (this.moveToTarget(creep, target)) {
        creep.repair(target);
      }
    }
  }
}

export function initializeTaskSystem(): void {
  // This function can be called at the start of each tick
  TaskManager.runTasks();
}
