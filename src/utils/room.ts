/** 
 *  @description 生成相邻房间名称
 *  @example console.log(generateAdjacentRoomName('W12N34', 'E')); // 输出: W11N34
 */
export function generateAdjacentRoomName(currentRoomName: string, direction: 'W' | 'E' | 'N' | 'S'): string {
  const match = currentRoomName.match(/([WE])(\d+)([NS])(\d+)/);
  if (!match) {
    throw new Error('Invalid room name format.');
  }

  let [, ew, xStr, ns, yStr] = match;
  let x = parseInt(xStr, 10);
  let y = parseInt(yStr, 10);

  switch (direction) {
    case 'W':
      x = ew === 'W' ? x + 1 : x - 1;
      if (x < 0) {
        x = Math.abs(x) - 1;
        ew = ew === 'W' ? 'E' : 'W';
      }
      break;
    case 'E':
      x = ew === 'E' ? x + 1 : x - 1;
      if (x < 0) {
        x = Math.abs(x) - 1;
        ew = ew === 'E' ? 'W' : 'E';
      }
      break;
    case 'N':
      y = ns === 'N' ? y + 1 : y - 1;
      if (y < 0) {
        y = Math.abs(y) - 1;
        ns = ns === 'N' ? 'S' : 'N';
      }
      break;
    case 'S':
      y = ns === 'S' ? y + 1 : y - 1;
      if (y < 0) {
        y = Math.abs(y) - 1;
        ns = ns === 'S' ? 'N' : 'S';
      }
      break;
    default:
      throw new Error('Invalid direction. Use W, E, N, or S.');
  }

  return `${ew}${x}${ns}${y}`;
}
