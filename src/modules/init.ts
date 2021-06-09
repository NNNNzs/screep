const defaultRoom = Game.spawns['Spawn1'].room;

export const terminalMount = () => {
  if (!Memory.terminal) {
    // Game.spawns.room;
  }
}

export const storageMount = () => {
  if (!Memory.terminal) {

  }

}
export const transferMount = () => {
  Memory.transferList = [
    { sourceType: RESOURCE_ENERGY, mount: 120000, remain: 200000, profit: 0.5 },
    { sourceType: RESOURCE_UTRIUM, mount: 120000, remain: 10000, profit: 0.3 },
  ]
}

export const townerMount = (pos: Room = defaultRoom) => {
  Memory.towerList = pos.find(FIND_STRUCTURES, {
    filter: s => s.structureType === STRUCTURE_TOWER
  }).map(e => e.id)
}

export const containerListMount = (pos: Room = defaultRoom) => {
  const containers = pos.find(FIND_STRUCTURES, {
    filter: s => s.structureType === STRUCTURE_CONTAINER
  });
  Memory.containerList = containers
}


export const init = () => {
  terminalMount()
  storageMount()
  transferMount()
  townerMount()
  containerListMount()
}