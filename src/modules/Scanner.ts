import { toFixedList, toBuildList, autoStructure, isRoomExist } from '@/modules/structure';
import { ROLE_NAME_ENUM } from '@/var';
import { SpawnQueue, deleteCreepMemory } from './autoCreate';
import { log, runAfterTickTask, runPerTime, useCpu } from '@/utils';

export type StructureType = STRUCTURE_SPAWN | STRUCTURE_EXTENSION | STRUCTURE_CONTAINER | STRUCTURE_STORAGE | STRUCTURE_TERMINAL | STRUCTURE_TOWER;

/**
 * 房间扫描器类
 * @class RoomScanner
 * @description 负责扫描房间内的各种信息并更新到Memory中
 */
export class RoomScanner {
  private room: Room;
  private roomName: string;
  private roomMemory: RoomMemory;

  constructor(room: Room) {
    this.room = room;
    this.roomName = room.name;
    this.roomMemory = Memory.rooms[this.roomName];
  }

  /**
   * 初始化房间Memory
   */
  public static initMemory(): void {
    if (!Memory.logLevel) {
      Memory.logLevel = ['info', 'warn', 'error'];
    }

    if (!Memory.rooms) {
      Memory.rooms = {};
    }

    Object.keys(Game.rooms).forEach((roomName) => {
      if (!Memory.rooms[roomName]) {
        Memory.rooms[roomName] = {
          noSource: false,
          creepIndex: 0,
          maxWorker: 4,
          carrysLength: 0,
          harvestersLength: 0,
          toFixedStructures: [],
          toConstructionSite: [],
          spawnQueue: [],
          sourcesList: [],
          emptyStructureList: [],
          sourceStructure: [],
          controllerLevel: 0
        };
      }
    });
  }

  /**
   * 扫描房间内的所有结构
   */
  public scanStructure(): void {
    autoStructure(this.room);
    this.findEmptySourceStructure([STRUCTURE_SPAWN, STRUCTURE_EXTENSION, STRUCTURE_TOWER]);
    this.findSourceStructure([STRUCTURE_STORAGE, STRUCTURE_CONTAINER]);
    this.updateControllerLevel();
  }

  /**
   * 查找空的可以送能量的建筑
   */
  private findEmptySourceStructure(rank: StructureType[]): void {
    let sources: AnyStoreStructure[] = [];

    rank.some((structureType) => {
      const notFullStructures = this.room.find(FIND_STRUCTURES, {
        filter: (s) => s.structureType === structureType && s.store.getFreeCapacity(RESOURCE_ENERGY) > 0
      }) as AnyStoreStructure[];

      if (notFullStructures.length > 0) {
        sources = notFullStructures;
        return true;
      }
      return false;
    });

    this.roomMemory.emptyStructureList = sources.map(e => e.id);
  }

  /**
   * 查找可以拿能量的建筑
   */
  private findSourceStructure(rank: StructureType[] = [STRUCTURE_STORAGE, STRUCTURE_CONTAINER]): void {
    let sources: AnyStoreStructure[] = [];

    rank.some((structureType) => {
      const hasSourceStructure = this.room.find(FIND_STRUCTURES, {
        filter: (s) => s.structureType === structureType && s.store.getUsedCapacity(RESOURCE_ENERGY) > 0
      }) as AnyStoreStructure[];

      if (hasSourceStructure.length > 0) {
        sources = hasSourceStructure;
        return true;
      }
      return false;
    });

    this.roomMemory.sourceStructure = sources.map(e => e.id);
  }

  /**
   * 更新控制器等级
   */
  private updateControllerLevel(): void {
    const controller = this.room.controller;
    if (controller) {
      const oldLevel = this.roomMemory.controllerLevel;
      const newLevel = controller.level;

      this.roomMemory.maxWorker = newLevel < 6 ? 9 - newLevel : 4;

      if (oldLevel !== newLevel) {
        this.roomMemory.controllerLevel = newLevel;
        this.onControllerLevelChange();
      }
    }
  }

  /**
   * 控制器等级变化时的处理
   */
  private onControllerLevelChange(): void {
    this.roomMemory.maxExtension = false;
    this.roomMemory.roaded = false;

    for (const creepName in Game.creeps) {
      delete Game.creeps[creepName].memory.isMaxCountBody;
    }
  }

}

/**
 * 全局扫描器
 */
export class GlobalScanner {
  /**
   * 执行全局扫描
   */
  public static scan(): void {
    RoomScanner.initMemory();

    for (const roomName in Memory.rooms) {
      const room = Game.rooms[roomName];
      if (!room) continue;

      const scanner = new RoomScanner(room);
      scanner.scanStructure();
    }

    deleteCreepMemory();
    toFixedList();
    this.findAttackers();
    toBuildList();
  }

  /**
   * 查找敌人
   */
  private static findAttackers(): void {
    Object.keys(Memory.rooms).forEach(roomName => {
      const room = Game.rooms[roomName];
      if (!room) return;

      if (!Memory.rooms[roomName].attackers) {
        Memory.rooms[roomName].attackers = [];
      }

      const attackers = room.find(FIND_HOSTILE_CREEPS);

      if (attackers.length > 0) {
        Memory.rooms[roomName].attackers = attackers.map(a => ({ id: a.id }));
        Game.notify(`房间${roomName}有${attackers.length}个攻击者, 请注意! 时间是${Game.time}`);

        this.handleTowerDefense(room, attackers);
      }
    });
  }

  /**
   * 处理防御塔的防御逻辑
   */
  private static handleTowerDefense(room: Room, attackers: Creep[]): void {
    const towers = room.find(FIND_MY_STRUCTURES, {
      filter: object => object.structureType === STRUCTURE_TOWER
    }) as StructureTower[];

    if (towers.length === 0) return;

    // 攻击敌人
    towers.forEach(tower => tower.attack(attackers[0]));

    // 治疗受伤的爬虫
    const toHeal = room.find(FIND_MY_CREEPS, {
      filter: creep => creep.hits < creep.hitsMax
    });

    if (toHeal.length > 0 && towers.length > 0) {
      towers[0].heal(toHeal[0]);
    }
  }
}

// 导出一个便捷的扫描函数
export const roomScanner = () => GlobalScanner.scan();