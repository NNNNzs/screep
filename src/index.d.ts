interface stateItem {
  gcl: number;
  gclLevel: number;
  gpl: number;
  gplLevel: number;
  cpu: number;
  bucket: number;
}

/** 需要转移并且出售的资源 */
declare interface transferItem {
  /** 资源类型 */
  sourceType: ResourceConstant;
  /** 可以出售的数量 */
  mount: number;
  /** storage需要剩余 */
  remain: number;
  /** 一个比例 */
  profit: number;
}

interface CreepMemory {
  role: string;
  costTime: number;
  building?: boolean;
}

/** 工具人 Memory */
interface CreepMemory {
  working: boolean
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
  // 敌人的creep
  toKillList: Creep;
  // 状态
  stats: stateItem;
  // 资源类型
  transferSrouceType: string;
  // 是否需要转移资源
  showTransfer: boolean;


}

interface Order {
  profit?: number;
}


interface Creep {
  /** 从建筑物里面拿出资源 */
  getResourceByStructure: () => void,
  self_harvest: (index: number) => void
}