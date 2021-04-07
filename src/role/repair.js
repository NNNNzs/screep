export default  {
  run(creep) {
    // 已使用的容量，即可用资源
    if (creep.store.getUsedCapacity() == 0) {
      // creep.memory.isEmpty = true;
      creep.memory.objId = null;
      creep.getResourceByStructure();
      creep.say('补货')
    } else {
      creep.fixing()
    }
  }
}