export const terminalMount = (sourceType) => {
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
    { sourceType: RESOURCE_ENERGY, mount: 150000, profit: 0.5 },
    { sourceType: RESOURCE_UTRIUM, mount: 150000, profit: 0.2 },
  ]

}

export const init = () => {
  terminalMount()
  storageMount()
  transferMount()
}