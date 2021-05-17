
const terminal = Game.getObjectById(Memory.terminal);
const storage = Game.getObjectById(Memory.storage)

const market = {
  // 计算收益
  sortFun(a, b) {
    const costA = Game.market.calcTransactionCost(a.amount, 'W24S33', a.roomName) / a.amount
    const costB = Game.market.calcTransactionCost(b.amount, 'W24S33', b.roomName) / b.amount
    const profitA = a.price - costA;
    const profitB = b.price - costB
    a.profit = profitA
    b.profit = profitB
    return profitA > profitB ? -1 : 1;
  },
  getOrder() {
    const orders = Memory.transferList.map(ele => {
      const { sourceType, profit } = ele;
      const order = Game.market.getAllOrders({
        type: ORDER_BUY,
        resourceType: sourceType
      }).sort(market.sortFun).filter(o => o.profit > profit)
      return order
    })
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
    // Game.market.deal('606dc5adf5ceb112d9c1d522', 26309, "W24S33");
    arr.map(order => {
      return Game.market.deal(order.id, order.amount, "W24S33");
    });
    if (arr.length > 0) {
      // Game.notify(JSON.stringify(arr))
    }
  },
  showTransfer() {
    const taskList = Memory.transferList;
    const shouldTransfer = (taskList) => {
      return taskList.some(task => {
        const { sourceType, mount } = task;
        // store里面超过一定的数量，且terminal还可以存这么多
        const flag = storage.store.getUsedCapacity(sourceType) > mount && terminal.store.getFreeCapacity() > mount;
        if (flag) {
          Memory.transferSrouceType = sourceType
        }
        return flag
      })
    }
    const shouldTransferFlag = shouldTransfer(taskList);
    Memory.showTransfer = shouldTransferFlag
    // console.log('shouldTransferFlag', shouldTransferFlag)
    // 转移准备卖了
    return false;
  },
  run() {
    market.showTransfer();

    market.getOrder().forEach(orders => {
      if(orders.length>0){
        console.log('orders',JSON.stringify(orders))
        market.deal(orders)
      }
    });

  }
}
export default market