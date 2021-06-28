
// const terminal: StructureTerminal = Game.getObjectById(Memory.terminal);
// const storage: StructureStorage = Game.getObjectById(Memory.storage)

const market = {
  // 计算收益
  sortFun(a: Order, b: Order) {
    const costA = Game.market.calcTransactionCost(a.amount, 'W24S33', a.roomName) / a.amount
    const costB = Game.market.calcTransactionCost(b.amount, 'W24S33', b.roomName) / b.amount
    const profitA = a.price - costA;
    const profitB = b.price - costB
    a.profit = profitA
    b.profit = profitB
    return profitA > profitB ? -1 : 1;
  },
  getOrder() {
    const terminal: StructureTerminal = Game.getObjectById(Memory.terminal);
    // const transferList: transferItem[] = Memory.transferList;
    const orders = Memory.transferList.map(ele => {
      const { sourceType, profit } = ele;
      // terminal库存为0 直接跳过该类型的订单
      const used = terminal.store.getUsedCapacity(sourceType);
      // console.log(used)
      if (used === 0) {
        return []
      }
      // const startCpu = Game.cpu.getUsed();
      const order = Game.market.getAllOrders({
        type: ORDER_BUY,
        resourceType: sourceType
      }).sort(market.sortFun).filter(o => {
        return o.profit > profit
      });
      // const elapsed = Game.cpu.getUsed() - startCpu;
      // console.log('Creep ' + 'order' + ' has used ' + elapsed + ' CPU time');
      return order
    })
    // console.log(orders)
    return orders
  },
  // 创建出售的订单，这个要收费
  createSellOrder() {
    Game.market.createOrder({
      type: ORDER_SELL,
      resourceType: RESOURCE_ENERGY,
      price: 0.28,
      totalAmount: 100000,
      roomName: "W24S33"
    });
  },
  // 交易
  deal(arr = []) {
    const terminal: StructureTerminal = Game.getObjectById(Memory.terminal);

    // Game.market.deal('606dc5adf5ceb112d9c1d522', 26309, "W24S33");
    const status = arr.map(order => {
      const { resourceType } = order
      const has = terminal.store.getUsedCapacity(resourceType)
      // const mount = order.amount > terminal.store.getUsedCapacity()
      console.log(resourceType, has, order.amount)
      //梭哈，不留
      const num = has < order.amount ? has : order.amount
      console.log(num);
      return Game.market.deal(order.id, num, "W24S33");
    });
    if (arr.length > 0) {
      // Game.notify(JSON.stringify(arr))
      console.log(status)
    }
  },
  showTransfer() {
    const terminal: StructureTerminal = Game.getObjectById(Memory.terminal);
    const storage: StructureStorage = Game.getObjectById(Memory.storage)
    
    const taskList = Memory.transferList;
    const terminalNotFull = terminal.store.getFreeCapacity() > 10000
    // console.log(terminalNotFull)
    const shouldTransfer = (taskList: transferItem[]) => {
      return taskList.some(task => {
        const { sourceType, mount, remain } = task;
        // store里面超过一定的数量
        const storageExis = storage.store.getUsedCapacity(sourceType)
        const isStorageExisEnough = storageExis > mount + remain;
        //terminal还可以存这么多
        const terminalFree = terminal.store.getFreeCapacity(sourceType)
        const isTerminalCanSave = terminalFree > mount;
        //terminal已经存在这么多
        const terminalExis = terminal.store.getUsedCapacity(sourceType);
        const isTerminalExis = terminalExis < mount;

        const flag = isStorageExisEnough && isTerminalCanSave && isTerminalExis;
        // 这里有问题，TODO
        if (flag) {
          console.log(sourceType, 'storageExis', storageExis, 'terminalFree', terminalFree, 'terminalExis', terminalExis)
          // console.log(storageExis, terminalCanSave, sourceType)
          Memory.transferSrouceType = sourceType
        }
        return flag
      })
    }
    // console.log(terminalNotFull)
    const shouldTransferFlag = terminalNotFull && shouldTransfer(taskList);
    Memory.showTransfer = shouldTransferFlag
  },
  run() {
    market.showTransfer();

    market.getOrder().forEach(orders => {
      if (orders.length > 0) {
        market.deal(orders)
      }
    });

  }
}
export default market