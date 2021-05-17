interface stateItem {
  gcl: number,
  gclLevel: number,
  gpl: number,
  gplLevel: number,
  cpu: number,
  bucket: number
}

interface Memory {
  // 待修复的列表
  toFixedStructures: AnyOwnedStructure[]
  // 终端的id
  terminal: string,
  // 待转移的列表
  transferList: object[]
  // 塔的列表
  towerList: string[]
  // 
  toKillList: Creep

  stats: stateItem
}