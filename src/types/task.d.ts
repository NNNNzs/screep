export declare enum TaskStatus {
  READY = 1,
  RUNNING = 2,
  DONE = 3
};

export declare enum TaskType {
  /** 挖矿任务 */
  harvest = "harvest",
  /** 建造任务 */
  build = "build",
  /** 升级任务 */
  upgrade = "upgrade",
  /** 维修任务 */
  repair = "repair",
  /** 把东西拿到target   */
  carry = "carry",
  /** 从target中拿东西 */
  take = "take",
  /** 续命 */
  renew = "renew",

  /** 发呆 */
  wait = "wait"
};

export declare interface TaskItem {
  /** 任务id */
  id?: string

  /** 任务类型 */
  type: TaskType

  /** 任务状态 */
  status?: TaskStatus

  /** 任务优先级 */
  orderNum?: number

  /** 任务目标 */
  targetId?: string

  /** 任务所在房间 */
  roomName?: string

  /** 执行人id */
  executorId?: string[]

  /** 最大执行人 */
  maxExecutorId?: number

  /** 任务额外信息 */
  params?: Record<string, any>
};


export declare type IGetTaskFilter = (t: TaskItem) => boolean
