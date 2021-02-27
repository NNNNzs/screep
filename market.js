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
  // 计算传输费用
  calcTransactionCost(){
    const cost = Game.market.calcTransactionCost(1000, 'W0N0', 'W10N5');
  },
  // 交易
  deal(){
    // Game.market.deal('57cd2b12cda69a004ae223a3', 1000, "W1N1");
  },
  run() {
    // market.getOrder()
  }
}
module.exports = market