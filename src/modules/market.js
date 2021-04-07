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
    const order = Game.market.getAllOrders({
      type: ORDER_BUY,
      resourceType: RESOURCE_ENERGY
    }).sort(market.sortFun).filter(o => o.profit > 0)
    return order
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
  // 执行别人买的订单
  dealSellOrder() {
    Game.market.deal()
  },
  // 计算传输费用
  calcTransactionCost() {
    const cost = Game.market.calcTransactionCost(1000, 'W0N0', 'W10N5');
  },
  // 交易
  deal(arr = []) {
    // Game.market.deal('606dc5adf5ceb112d9c1d522', 26309, "W24S33");
    const res = arr.map(order => {
      return Game.market.deal(order.id, order.amount, "W24S33");
    });
    if(arr.length>0){
      Game.notify(JSON.stringify(arr),JSON.stringify(res))
    }
  },
  showTransfer() {
    const storage = Game.getObjectById(Memory.storage);
    const terminal = Game.getObjectById('60219ee55a1b60469b3c8861');
    const sourceType = RESOURCE_ENERGY;
    const mount = 300000;
    // 转移准备卖了
    if (storage.store.getUsedCapacity(sourceType) > mount && terminal.store.getUsedCapacity(sourceType) < mount) {
      Memory.showTransfer = true;
    } else {
      Memory.showTransfer = false;
    }
  },
  run() {
    market.showTransfer()
    market.deal(market.getOrder())
    // const order = market.getOrder();
  }
}
export default market