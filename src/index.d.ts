interface stateItem {
  gcl: number;
  gclLevel: number;
  gpl: number;
  gplLevel: number;
  cpu: number;
  bucket: number;
}

interface transferItem {
  sourceType: ResourceConstant;
  mount: number; //可以出售
  remain: number; //storage需要剩余
  profit: number;
}

interface CreepMemory {
  role: string;
  costTime: number;
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
