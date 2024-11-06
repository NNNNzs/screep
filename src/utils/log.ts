
const disaabled = (first: string) => {
  const banList = Memory.logBan || [];
  return banList.some(e => first.startsWith(e))
}

/** 
 * @description 日志
 */
export function log(first: string, ...args) {
  const showList = ['module/mount', 'module/structure', 'behavior/harvester'];
  if (disaabled(first)) return;
  if (showList.includes(first)) {
    console.log(`<span style='color:green'>[info] ${first}</span>`, args)
  }
}

log.info = function (first: string, ...args) {
  if (Memory.logLevel?.includes('info') || Memory.logLevel?.includes('all')) {
    if (disaabled(first)) return;
    console.log(`<span style='color:green'>[info] ${first}</span>`, args)
  }
}
log.warn = function (first: string, ...args) {
  if (Memory.logLevel?.includes('warn') || Memory.logLevel?.includes('all')) {

    console.log(`<span style='color:yellow'>[warn] ${first}</span>`, args)
  }
}
log.error = function (first: string, ...args) {
  if (Memory.logLevel?.includes('error') || Memory.logLevel?.includes('all')) {

    console.log(`<span style='color:red'>[error] ${first}</span>`, args)
  }
}
log.addLevel = function (level: LogLevel) {
  if (!Memory.logLevel) {
    Memory.logLevel = []
  }
  Memory.logLevel.push(level)
};

log.removeLevel = function (level: LogLevel) {
  if (Memory.logLevel) {
    Memory.logLevel = Memory.logLevel.filter(e => e !== level)
  }
}

// 添加屏蔽列表
log.addBan = function (band: string) {
  if (!Memory.logBan) {
    Memory.logBan = []
  }
  Memory.logBan.push(band)
};
// 移除屏蔽列表
log.removeBan = function (band: string) {
  if (Memory.logBan) {
    Memory.logBan = Memory.logBan.filter(e => e !== band)
  }
};

global.log = log;
