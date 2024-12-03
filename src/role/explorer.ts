import BaseRole from './base';
import { generateAdjacentRoomName } from "../utils/room";
import { log } from "../utils";

export default class ExplorerRole extends BaseRole {
  public run(): void {
    const creep = this.creep;
    if (creep.room.name === creep.memory.nextRoomName) {
      creep.memory.moveTo = null;
      creep.memory.nextRoomName = null;
    }

    if (creep.memory.moveTo) {
      const p = new RoomPosition(
        creep.memory.moveTo.x,
        creep.memory.moveTo.y,
        creep.memory.moveTo.roomName
      );
      creep.moveTo(p);
      return;
    }

    // ... 其余逻辑
  }

  private getExitDirection(exit: RoomPosition): string {
    if (exit.x === 0) return 'W';
    if (exit.x === 49) return 'E';
    if (exit.y === 0) return 'N';
    if (exit.y === 49) return 'S';
    return 'W'; // 默认返回
  }

  private isMaxControllerRooms(): boolean {
    const controllerLevelRooms = Object.keys(Game.rooms)
      .filter(roomName => Game.rooms[roomName].controller?.my);
    return controllerLevelRooms.length >= Game.gcl.level;
  }
}