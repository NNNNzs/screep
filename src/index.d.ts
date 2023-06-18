export { };
declare global {
  type toConstructionSite = ConstructionSite<BuildableStructureConstant>[];
  type toFixedStructures = AnyStructure[]

  type abc = string;




  /** 通用的CreepMemory */
  interface CreepMemory {
    role: string;
    costTime: number;
    building?: boolean;
  }

  interface stateItem {
    gcl: number;
    gclLevel: number;
    gpl: number;
    gplLevel: number;
    cpu: number;
    bucket: number;
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
    job?: 'build' | 'fix' | 'upgrader'
    target?: string;
  }


  interface Memory {
    // 待修复的列表
    toFixedStructures: AnyStructure[];
    // 终端的id
    terminal: string;
    // 存储桶
    storage: string;
    // 待转移的列表
    transferList: transferItem[];
    // 塔的列表
    towerList: string[];
    //容器列表
    containerList: AnyStructure[];
    //待建造的建筑
    toConstructionSite: ConstructionSite[];

    // 状态
    stats: stateItem;
    // 资源类型
    transferSrouceType: string;
    // 是否需要转移资源
    showTransfer: boolean;

  }

  interface RoomMemory {

    aaaa: string;
    terminalId?: string;
    storageId?: string;

    transferList?: transferItem[];

    /**塔的列表 */
    towerIdList?: string[];

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

  interface Creep {
    /** 从建筑物里面拿出资源 */
    getResourceByStructure: () => void,
    self_harvest: (index: number) => void
  }

}

