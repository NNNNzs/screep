import { creepExtension } from "../modules/mount";
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
  const _: typeof import('lodash');

  type toConstructionSite = ConstructionSite<BuildableStructureConstant>[];
  type toFixedStructures = AnyStructure[]



  interface Creep {
    /** 从建筑物里面拿出资源 */
    getResourceByStructure: () => void,
    self_harvest: (index: number) => void
  }

  interface Memory {
    lastModified: string;
    startTick: number;
    stats?: stateItem
  }




  /** 通用的CreepMemory */
  interface CreepMemory {
    role: string;
    costTime?: number;
    building?: boolean;
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

  /** 工具人 Memory */
  interface CreepMemory {
    working?: boolean
    targetId?: string
    task?: string
    job?: 'build' | 'fix' | 'upgrader'
    target?: string;
  }



  interface RoomMemory {

    terminalId?: string;

    storageId?: string;

    transferList?: transferItem[];

    /**塔的列表 */
    towerIdList?: string[];

    /** 资源列表 */
    sourcesList: any[],

    /** 容器id列表 */
    containerIdList?: string[];

    /** 待建造列表 */
    toConstructionSite?: ConstructionSite[];

    /** 待修复列表 */
    toFixedStructures?: AnyStructure[];

    /** 需要转移的资源，目前没想好 */
    carryList?: any[]

    /** 待治疗的screepId */
    toHealCreepId?: string[]
    // [name: string]: {

    // }

  }


  interface Order {
    profit?: number;
  }

}

