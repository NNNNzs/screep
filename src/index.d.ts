interface stateItem {
  gcl: number,
  gclLevel: number,
  gpl: number,
  gplLevel: number,
  cpu: number,
  bucket: number
}

interface transferItem {
  sourceType: ResourceConstant,
  mount: number,//可以出售
  remain: number,//storage需要剩余
  profit: number
}

interface Memory {
  // 待修复的列表
  toFixedStructures: AnyStructure[]
  // 终端的id
  terminal: string,
  // 存储桶
  storage: string,
  // 待转移的列表
  transferList: transferItem[]
  // 塔的列表
  towerList: string[]

  containerList:AnyStructure[] //
  // 敌人的creep
  toKillList: Creep
  stats: stateItem
  // 资源类型
  transferSrouceType: string

  showTransfer: boolean
}

interface Order {
  profit?: number
}
