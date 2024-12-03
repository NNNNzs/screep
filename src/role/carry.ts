import BaseRole from './base';
import { TaskType } from "@/modules/Task";
import renew, { CREEP_LIFE_TIME_MIN, assignRenewTask, shouldRenew } from "@/behavior/renew";
import taskRunner from "@/task/run";
import { log, sortByRange, sortByUsedCapacity } from "@/utils";
import { assignTakeTask } from "@/behavior/take";

export default class CarryRole extends BaseRole {
  // 保持原有的TASK_PRIORITY不变
  private static readonly TASK_PRIORITY = {
    TOWER_REFILL: 1,
    SPAWN_REFILL: 2,
    STORAGE_DEPOSIT: 3,
    COLLECT_DROPPED: 4,
    COLLECT_TOMBSTONE: 5,
    COLLECT_RUIN: 6,
    COLLECT_CONTAINER: 7,
  };

  public run(): void {
    taskRunner(this.creep, this.assignTasks.bind(this));
  }

  private assignTasks(): void {
    const creep = this.creep;
    const roomName = creep.room.name;
    const room = Game.rooms[roomName];
    const roomMemory = Memory.rooms[roomName];
    const storage = room.storage;

    const freeCapacity = creep.store.getFreeCapacity(); // 获取口袋剩余容量
    // 检查是否为空口袋
    const emptySource = creep.store.getUsedCapacity() === 0;
    // 检查是否有资源
    const hasResource = creep.store.getUsedCapacity() > 0;
    // 检查是否有能量
    const hasEnergy = hasResource && creep.store.getUsedCapacity(RESOURCE_ENERGY) > 0;
    // 检查是否有其他资源
    const hasOtherResource = hasResource && creep.store.getUsedCapacity() !== creep.store.getUsedCapacity(RESOURCE_ENERGY);

    // 获取空闲的生产建筑列表
    const emptySpawn = _.cloneDeep(roomMemory.emptyStructureList);

    /** 有空的生产队列 */
    const hasEmptySpawn = emptySpawn.length > 0;



    // 获取可用的塔
    const towers = room.find(FIND_MY_STRUCTURES, {
      filter: (s) => s.structureType === STRUCTURE_TOWER && s.store.getFreeCapacity(RESOURCE_ENERGY) > 0
    }) as StructureTower[];


    // 检查是否存在紧急情况（塔的能量低于50%）
    const hasEmergency = towers.some(tower => tower.store.getUsedCapacity(RESOURCE_ENERGY) < tower.store.getCapacity(RESOURCE_ENERGY) * 0.5);

    // 需要优先补充能量
    const needCarryEnergy = hasEmptySpawn || hasEmergency;





    /** 从桶中取能量 */
    const getFromStorage = (sourceType?: ResourceConstant) => {
      if (!storage) return false;
      const storageEnergy = storage.store.getUsedCapacity(sourceType);
      if (storageEnergy > 0) {
        assignTakeTask(creep, {
          targetId: storage.id,
          taskType: TaskType.take,
          targetType: STRUCTURE_STORAGE,
          sourceType: sourceType,
          takeFrom: storage
        });
        creep.say('getFromStorage success');
        return true;
      }
      creep.say('getFromStorage fail');
      return false;
    };

    /** 从容器中取能量 */
    const getFromContainer = (sourceType?: ResourceConstant) => {
      const containers = room.find(FIND_STRUCTURES, {
        filter: (s) => s.structureType === STRUCTURE_CONTAINER && 
                      s.store.getUsedCapacity(sourceType) > 0
      }) as StructureContainer[];

      if (!containers || containers.length === 0) return false;

      const newContainers = sortByUsedCapacity(containers, { 
        orderBy: 'desc', 
        resource: sourceType 
      });
      const target = newContainers[0];

      assignTakeTask(creep, {
        targetId: target.id,
        taskType: TaskType.take,
        targetType: STRUCTURE_CONTAINER,
        sourceType: sourceType,
        takeFrom: target
      });

      log.info('behavior/carry/getFromContainer', 'take from', STRUCTURE_CONTAINER);
      return true;
    };

    /** 从墓碑和遗迹中取资源 */
    const getFromTombstonesAndRuins = () => {

      const tombstones = creep.room.find(FIND_TOMBSTONES, {
        filter: (s) => s.store.getUsedCapacity() > 0
      });

      const ruins = creep.room.find(FIND_RUINS, {
        filter: (s) => s.store.getUsedCapacity() > 0
      });

      const dropped = creep.room.find(FIND_DROPPED_RESOURCES, {
        filter: (s) => s.amount > 0
      });

      log('behavior/carry/getFromTombstonesAndRuins', 'tombstones', tombstones, 'ruins', ruins, 'dropped', dropped)

      if (tombstones.length > 0) {

        const target = tombstones[0];

        assignTakeTask(creep, {
          targetId: target.id,
          taskType: TaskType.take,
          targetType: target,
          takeFrom: target
        })


        return true;
      }
      else if (ruins.length > 0) {
        const target = ruins[0];
        assignTakeTask(creep, {
          targetId: target.id,
          taskType: TaskType.take,
          targetType: target,
          takeFrom: target
        })


        return true;
      } else if (dropped.length > 0) {
        const target = dropped[0];
        assignTakeTask(creep, {
          targetId: target.id,
          taskType: TaskType.take,
          targetType: target,
          takeFrom: target
        })
        return true;
      }

      return false;
    }

    const sendToSpawn = () => {
      const freeSpawn = emptySpawn.sort((a, b) => {
        const aSource = Game.getObjectById(a) as StructureExtension;
        const bSource = Game.getObjectById(b) as StructureExtension;
        return aSource.pos.getRangeTo(creep.pos) - bSource.pos.getRangeTo(creep.pos);
      });

      creep.memory.task = TaskType.carry;
      creep.memory.targetId = freeSpawn[0];
      creep.memory.priority = CarryRole.TASK_PRIORITY.SPAWN_REFILL;
    };

    const sendToStorage = () => {
      if (!storage) return;
      creep.memory.task = TaskType.carry;
      creep.memory.targetId = storage.id;
      creep.memory.priority = CarryRole.TASK_PRIORITY.STORAGE_DEPOSIT;
    };

    const sendToTower = () => {
      const towers = room.find(FIND_MY_STRUCTURES, {
        filter: (s) => s.structureType === STRUCTURE_TOWER && 
                      s.store.getFreeCapacity(RESOURCE_ENERGY) > 0
      }) as StructureTower[];
      
      if (towers.length === 0) return;
      
      sortByRange(creep.pos, towers);
      creep.memory.task = TaskType.carry;
      creep.memory.targetId = towers[0].id;
      creep.memory.priority = CarryRole.TASK_PRIORITY.TOWER_REFILL;
    };

    const waitSomeTime = () => {
      log('behavior/carry/waitSomeTime', '无任务');
      creep.memory.task = TaskType.wait;
      creep.memory.waitTime = Game.time + 10;
    };

    if (hasResource) {
      if (hasEnergy) {
        if (hasEmergency) {
          sendToTower();
        } else {
          if (hasEmptySpawn) {
            sendToSpawn();
          } else {
            sendToStorage();
          }
        }
      } else {
        sendToStorage();
      }
    } else {
      if (needCarryEnergy) {
        log('behavior/carry/needCarryEnergy', 'need carry energy')
        // 不能从桶里拿
        if (getFromStorage(RESOURCE_ENERGY)) {
          log('behavior/carry/getFromStorage', 'getFromStorage success');
        } // 尝试从存储获取能量
        // 不能从容器里拿
        else if (getFromContainer(RESOURCE_ENERGY)) { // 尝试从容器获取能量
          // log.info('behavior/carry/getFromContainer', 'needCarryEnergy', 'getFromContainer success');
        } else {
          log.warn('behavior/carry/waitSomeTime', '无任务')
          waitSomeTime() // 如果都不能获取，等待一段时间
        }
      }
      else if (shouldRenew(creep)) { // 检查是否需要更新 creep
        // log.info('behavior/carry/shouldRenew', 'should renew')
        assignRenewTask(creep); // 分配更新任务
      }
      // 尝试从墓碑和废墟获取能量
      else if (getFromTombstonesAndRuins()) {
        log.info('behavior/carry/getFromTombstonesAndRuins', 'getFromTombstonesAndRuins success');
      }
      else if (getFromContainer()) { // 再次尝试从容器获取能量
        // log.warn('behavior/carry/getFromContainer', 'needCarry', 'getFromContainer success');
      } else {
        waitSomeTime() // 如果都不能获取，等待一段时间
      }
    }
  }
}
