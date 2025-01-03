import { ROLE_NAME_ENUM } from "@/var";
import { creepExtension } from "../modules/mount";
import { TaskType, TaskItem } from "@/modules/Task";
export { };


interface stateItem {
  gcl: number;
  gclLevel: number;
  gpl: number;
  gplLevel: number;
  cpu: number;
  bucket: number;
}
declare global {
  // @ts-ignore
  const _: typeof import('lodash');

  type toConstructionSite = ConstructionSite<BuildableStructureConstant>[];
  type toFixedStructures = AnyStructure[];




  interface Creep {
    run(): void;
  }

  type AfterTickTask = {
    tick: number;
    fun: Function
  }

  type LogLevel = 'info' | 'warn' | 'error' | 'all';
  interface Memory {
    lastModified: string;
    startTick: number;
    stats?: stateItem;
    logLevel: LogLevel[];
    logBan: string[];

    taskList: TaskItem[];

    afterTickTask: AfterTickTask[]
  }




  /** 通用的CreepMemory */
  interface CreepMemory extends Record<string, any> {
    /** 角色 */
    role: ROLE_NAME_ENUM;
    /** 索引 */
    creepIndex?: number;

    task: TaskType;

    targetId?: string;

    taskList?: TaskItem[]

  }


  /** 需要转移并且出售的资源 */
  interface transferItem {
    /** 资源类型 */
    sourceType: ResourceConstant;
    /** 可以出售的数量 */
    mount: number;
    /** storage需要剩余 */
    remain: number;
    /** 一个比例 */
    profit: number;
  }

  interface SourceListItem {
    id: Resource['id'] | Mineral['id'] | Source['id'],
    sourceType: ResourceConstant,
    linkId?: string,
    containerId: string,
    creepId: string,
    roaded?: boolean,
    containerPos: RoomPosition
  }



  interface RoomMemory extends Record<string, any> {

    /** 最大工人数 */
    maxWorker: number;

    /** carry数量 */
    carrysLength: number;

    /** 采集者数量 */
    harvestersLength: number;

    terminalId?: string;

    transferList?: transferItem[];

    /** 是否已经道路齐全 */
    roaded?: boolean;

    /** 控制器是否已经道路齐全 */
    controllerRoaded?: boolean;


    /** 无资源的过道房间 */
    noSource?: boolean;

    /** 资源列表 */
    sourcesList: SourceListItem[]

    /** 容器id列表 */
    containerIdList?: string[];

    /** 待建造列表 */
    toConstructionSite?: ConstructionSite[];

    /** 待修复列表 */
    toFixedStructures?: AnyStructure[];

    /** 待治疗的screepId */
    toHealCreepId?: string[]

    /** 生产队列 */
    spawnQueue: ROLE_NAME_ENUM[]

    /** 能量未满的生产建筑 spwan extension */
    emptyStructureList?: AnyStoreStructure['id'][]

    /** 可以拿能量的建筑 */
    sourceStructure?: AnyStoreStructure['id'][];

  }


  interface Order {
    profit?: number;
  }

}