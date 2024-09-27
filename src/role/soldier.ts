import taskRunner from "@/task/run.js";

const assignTasks = function (creep: Creep) {

}

export default {
  run(creep) {
    taskRunner(creep, assignTasks)
  }
}