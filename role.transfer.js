const transfer = {
  sellEngrgy(creep){
    const sotrage = Game.getObjectById(Memory.storage)
    const mount = sotrage.store.getUsedCapacity(RESOURCE_ENERGY);
    if(mount>500000){
      // return true
      // creep.sellEngrgy = 
    }else{
      return false;
    }
  },
  run(){
    const sellEngrgy = transfer.sellEngrgy();
  }
}

modules.export = transfer