// 自动建造一些建筑
const build = {
  container() {
    const points = [{ x: 26, y: 33 }, { x: 26, y: 34 }];
    points.forEach(point => {
      Game.rooms.W27S26.createConstructionSite(point.x, point.y, STRUCTURE_CONTAINER)
    })
  },
  run() {
    build.container();
  }
}
module.exports = build
