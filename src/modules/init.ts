const defaultRoom = Game.spawns['Spawn1'].room;

export const terminalMount = (pos: Room = defaultRoom) => {
  // if (!Memory.terminal) {
  //   // Game.spawns.room;
  // }
}

export const storageMount = () => {
  // if (!Memory.terminal) {}

}
export const transferMount = () => {
  // if (Memory.transferList.length !== 0) return;

  // Memory.transferList = [
  //   { sourceType: RESOURCE_ENERGY, mount: 120000, remain: 200000, profit: 0.5 },
  //   { sourceType: RESOURCE_UTRIUM, mount: 120000, remain: 10000, profit: 0.3 },
  // ];

}

export const townerMount = (pos: Room = defaultRoom) => {
  // if (Memory.towerList.length !== 0) return;
  // Memory.towerList = pos.find(FIND_STRUCTURES, {
  //   filter: s => s.structureType === STRUCTURE_TOWER
  // }).map(e => e.id)
}

export const containerListMount = (pos: Room = defaultRoom) => {
  // if (Memory.containerList.length !== 0) return;
  // const containers = pos.find(FIND_STRUCTURES, {
  //   filter: s => s.structureType === STRUCTURE_CONTAINER
  // });
  // Memory.containerList = containers
}


export const init = () => {
  terminalMount()
  storageMount()
  transferMount()
  townerMount()
  containerListMount()
}