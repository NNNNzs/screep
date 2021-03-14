const market = {
  // 
  getOrder() {
    const order = Game.market.getAllOrders({
      type: ORDER_BUY,
      resourceType: RESOURCE_ENERGY
    });
    // return  order
    // console.log(JSON.stringify(order))
  },
  // 创建出售的订单，这个要收费
  createSellOrder() {
    Game.market.createOrder({
      type: ORDER_SELL,
      resourceType: RESOURCE_ENERGY,
      price: 0.32,
      totalAmount: 3000,
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
  deal() {
    Game.market.deal('6043454264712e30b74ee318', 3000, "W24S33");
  },
  showTransfer() {
    const storage = Game.getObjectById(Memory.storage);
    const terminal = Game.getObjectById('60219ee55a1b60469b3c8861');
    const sourceType = RESOURCE_ENERGY;
    const mount = 300000;
    if(storage.store.getUsedCapacity(sourceType)>mount && terminal.store.getUsedCapacity(sourceType)<mount){
      Memory.showTransfer = true;
    }else{
      Memory.showTransfer = true;
    }
  },
  run() {
    market.showTransfer()
  }
}
module.exports = market