import { log } from "@/utils";

/**
 * 任务优先级
 */
export enum TaskPriority {
  URGENT = 0,      // 紧急
  HIGH = 1,        // 高
  NORMAL = 2,      // 普通
  LOW = 3,         // 低
  IDLE = 4         // 空闲
}

/**
 * 任务状态
 */
export enum TaskStatus {
  PENDING = 'PENDING',      // 等待执行
  ASSIGNED = 'ASSIGNED',    // 已分配
  RUNNING = 'RUNNING',      // 执行中
  COMPLETED = 'COMPLETED',  // 已完成
  FAILED = 'FAILED'        // 失败
}

/**
 * 任务接口
 */
export interface Task {
  id: string;                     // 任务ID
  type: string;                   // 任务类型
  priority: TaskPriority;         // 优先级
  status: TaskStatus;             // 状态
  createdAt: number;             // 创建时间
  assignedTo?: string;           // 分配给的creep
  data?: any;                    // 任务数据
  room?: string;                 // 所属房间
  pos?: RoomPosition;            // 任务位置
  timeout?: number;              // 超时时间
}

/**
 * 任务管理器
 */
export class TaskManager {
  private tasks: Map<string, Task> = new Map();
  private tasksByRoom: Map<string, Set<string>> = new Map();
  private tasksByType: Map<string, Set<string>> = new Map();
  private tasksByCreep: Map<string, string> = new Map();

  /**
   * 添加任务
   */
  addTask(task: Task): void {
    // 生成任务ID
    if (!task.id) {
      task.id = `${task.type}_${Game.time}_${Math.random().toString(36).substr(2, 9)}`;
    }

    // 设置默认值
    task.status = task.status || TaskStatus.PENDING;
    task.createdAt = Game.time;

    // 保存任务
    this.tasks.set(task.id, task);

    // 按房间索引
    if (task.room) {
      if (!this.tasksByRoom.has(task.room)) {
        this.tasksByRoom.set(task.room, new Set());
      }
      this.tasksByRoom.get(task.room)?.add(task.id);
    }

    // 按类型索引
    if (!this.tasksByType.has(task.type)) {
      this.tasksByType.set(task.type, new Set());
    }
    this.tasksByType.get(task.type)?.add(task.id);

    log.info('TaskManager', 'Added task', task.id, task.type, task.priority);
  }

  /**
   * 分配任务给creep
   */
  assignTask(creepId: string, taskId: string): boolean {
    const task = this.tasks.get(taskId);
    if (!task || task.status !== TaskStatus.PENDING) {
      return false;
    }

    task.status = TaskStatus.ASSIGNED;
    task.assignedTo = creepId;
    this.tasksByCreep.set(creepId, taskId);

    log.info('TaskManager', 'Assigned task', taskId, 'to creep', creepId);
    return true;
  }

  /**
   * 完成任务
   */
  completeTask(taskId: string): void {
    const task = this.tasks.get(taskId);
    if (!task) return;

    task.status = TaskStatus.COMPLETED;
    
    if (task.assignedTo) {
      this.tasksByCreep.delete(task.assignedTo);
    }

    log.info('TaskManager', 'Completed task', taskId);
  }

  /**
   * 取消任务
   */
  cancelTask(taskId: string): void {
    const task = this.tasks.get(taskId);
    if (!task) return;

    // 清理索引
    if (task.room) {
      this.tasksByRoom.get(task.room)?.delete(taskId);
    }
    this.tasksByType.get(task.type)?.delete(taskId);
    if (task.assignedTo) {
      this.tasksByCreep.delete(task.assignedTo);
    }

    // 删除任务
    this.tasks.delete(taskId);

    log.info('TaskManager', 'Cancelled task', taskId);
  }

  /**
   * 获取指定房间的任务
   */
  getTasksByRoom(roomName: string): Task[] {
    const taskIds = this.tasksByRoom.get(roomName);
    if (!taskIds) return [];
    return Array.from(taskIds).map(id => this.tasks.get(id)!).filter(task => task);
  }

  /**
   * 获取指定类型的任务
   */
  getTasksByType(type: string): Task[] {
    const taskIds = this.tasksByType.get(type);
    if (!taskIds) return [];
    return Array.from(taskIds).map(id => this.tasks.get(id)!).filter(task => task);
  }

  /**
   * 获取creep当前的任务
   */
  getCreepTask(creepId: string): Task | undefined {
    const taskId = this.tasksByCreep.get(creepId);
    if (!taskId) return undefined;
    return this.tasks.get(taskId);
  }

  /**
   * 清理过期任务
   */
  cleanup(): void {
    const now = Game.time;
    for (const [taskId, task] of this.tasks) {
      // 清理超时任务
      if (task.timeout && now > task.timeout) {
        this.cancelTask(taskId);
        continue;
      }

      // 清理已完成任务
      if (task.status === TaskStatus.COMPLETED) {
        this.cancelTask(taskId);
        continue;
      }

      // 检查分配的creep是否还存在
      if (task.assignedTo && !Game.creeps[task.assignedTo]) {
        task.status = TaskStatus.PENDING;
        task.assignedTo = undefined;
      }
    }
  }

  /**
   * 运行任务管理器
   */
  run(): void {
    // 清理过期任务
    this.cleanup();

    // 处理每个房间的任务
    for (const room of Object.values(Game.rooms)) {
      const tasks = this.getTasksByRoom(room.name)
        .filter(task => task.status === TaskStatus.PENDING)
        .sort((a, b) => a.priority - b.priority);

      // 分配任务给空闲的creep
      const idleCreeps = room.find(FIND_MY_CREEPS).filter(creep => 
        !this.tasksByCreep.has(creep.id)
      );

      for (const creep of idleCreeps) {
        const suitableTask = tasks.find(task => this.isCreepSuitableForTask(creep, task));
        if (suitableTask) {
          this.assignTask(creep.id, suitableTask.id);
        }
      }
    }
  }

  /**
   * 判断creep是否适合执行任务
   */
  private isCreepSuitableForTask(creep: Creep, task: Task): boolean {
    // 根据任务类型和creep的角色判断是否适合
    // 这里需要根据具体的游戏逻辑来实现
    return true;
  }
}

// 导出全局任务管理器实例
export const taskManager = new TaskManager(); 