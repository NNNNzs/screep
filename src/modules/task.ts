
enum taskType {
  transfer = 'transfer',
  withdraw = 'withdraw'
}
interface TaskItem {
  id: string,
  type: taskType,
  from: string,
  to: string,
  sourceType: typeof RESOURCES_ALL,
  mount: number
  owner?: Creep
}

export class CarryTask {
  taskList = []
  createTask(item: TaskItem) {
    this.taskList.push(item)
  }
  getTask() {
    if (this.length > 0) {
      this.taskList.shift()
    }
  }
  get length() {
    return this.taskList.length;
  }
  checkTaskList(creep: Creep) {
    const tombstones = creep.room.find(FIND_TOMBSTONES, {
      filter: (s) => s.store.getUsedCapacity() > 0
    });

    const ruins = creep.room.find(FIND_RUINS, {
      filter: (s) => s.store.getUsedCapacity() > 0
    });

    if (tombstones.length > 0) {

    };

    if (ruins.length > 0) {

    }
    

  }
}