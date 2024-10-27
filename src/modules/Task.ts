enum TaskStatus {
  READY = 1,
  RUNNING = 2,
  DONE = 3
};

export enum TaskType {
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

export interface TaskItem {
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


type IGetTaskFilter = (t: TaskItem) => boolean

export class Task {
  _taskList: TaskItem[] = [];
  _taskSourceMap: Map<string, TaskItem> = new Map();

  constructor(room?: Room) {
    if (!Memory.taskList) {
      Memory.taskList = [];
    }
    this._taskList = Memory.taskList;
    this._taskSourceMap = new Map();

    Memory.taskList.forEach(t => {

      if (!t.executorId) t.executorId = [];
      t.executorId = t.executorId.filter(id => Game.creeps[id]);

      this._taskSourceMap.set(t.targetId, t)
    });

  }

  add(dto: TaskItem, param?: Record<string, any>) {
    const exis = this._taskSourceMap.has(dto.targetId);

    if (exis) return

    if (!dto.orderNum) {
      dto.orderNum = 99
    };
    if (!dto.executorId) {
      dto.executorId = [];
    }
    if (!dto.maxExecutorId) {
      dto.maxExecutorId = 1
    };
    if (param) {
      dto.params = param
    }
    dto.status = TaskStatus.READY;

    dto.id = Game.time + Math.random() + '';

    this._taskList.push(dto);
    this._taskSourceMap.set(dto.targetId, dto);
    this._taskList.sort((a, b) => a.orderNum - b.orderNum);
  }

  getTaskById(taskId: TaskItem['id']) {
    return this._taskSourceMap.get(taskId);
  }

  getTask(filter: IGetTaskFilter) {
    return this._taskList.filter(t => {
      // max executor
      const maxExecutorId = t.maxExecutorId;
      const currentExceutorLength = t.executorId.length;
      const READY = t.status === TaskStatus.READY;
      return READY && currentExceutorLength < maxExecutorId;
    }).filter(filter);
  }

  /** 任务领取 */
  invoke(creep: Creep, task: TaskItem) {

    task.executorId.push(creep.id);
    task.status = TaskStatus.RUNNING;

    creep.memory.taskList.push(task);
  }

  /** 任务完成 */
  finish(task: TaskItem) {

    task.status = TaskStatus.DONE;

    task.executorId.forEach(id => {
      const creep = Game.creeps[id];
      if (creep) {
        creep.memory.taskList = creep.memory.taskList.filter(t => t.id !== task.id)
      }
    });

    this._taskList = this._taskList.filter(t => t.targetId !== task.id)
    this._taskSourceMap.delete(task.id)
  }
}



export const globalTask = new Task();