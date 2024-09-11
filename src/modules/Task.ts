enum TaskStatus {
  READY = 1,
  RUNNING = 2,
  DONE = 3
};

enum TaskType {
  /** 挖矿任务 */
  harvest = "harvest",
  /** 建造任务 */
  build = "build",
  /** 升级任务 */
  upgrade = "upgrade",
  /** 维修任务 */
  repair = "repair",
  /** 把东西拿走 */
  carry = "carry",
  /** 拿东西过来 */
  take = "take",
};

interface TaskItem {
  /** 任务id */
  id?: string

  /** 任务类型 */
  type: TaskType

  /** 任务状态 */
  status: TaskStatus

  /** 任务优先级 */
  orderNum?: number

  /** 任务目标 */
  targetId?: string

  /** 任务所在房间 */
  roomName?: string

  /** 执行人id */
  executorId: string[]

  /** 最大执行人 */
  maxExecutorId: number

  /** 任务额外信息 */
  params?: string
};


type IGetTaskFilter = (t: TaskItem) => boolean

export class Task {
  _taskList: TaskItem[] = [];
  _taskSourceMap: Map<string, TaskItem> = new Map();

  constructor(room?: Room) {
    this._taskList = Memory.taskList;
    this._taskSourceMap = new Map();
    Memory.taskList.forEach(t => this._taskSourceMap.set(t.targetId, t));

  }
  add(dto: TaskItem) {
    const exis = this._taskSourceMap.has(dto.targetId);
    if (exis) return

    if (!dto.orderNum) {
      dto.orderNum = 99
    };

    dto.id = Game.time + '_' + Math.random();

    this._taskList.push(dto)
    this._taskSourceMap.set(dto.targetId, dto)
  }

  getTask(filter: IGetTaskFilter) {
    return this._taskList.filter(t => t.status === TaskStatus.READY).filter(filter)
  }

  remove(task: TaskItem) {
    this._taskList = this._taskList.filter(t => t.targetId !== task.targetId)
  }

  finish(taskId: TaskItem['id']) {
    this._taskList = this._taskList.filter(t => t.targetId !== task.targetId)
  }

  /** 任务执行 */
  invoke(creep: Creep, task: TaskItem) {
    task.status = TaskStatus.RUNNING
    creep.memory.task = task.type;
    task.executorId.push(creep.id);
  }

}

export default new Task();