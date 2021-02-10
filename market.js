const market = {
  getOrder(){
    const order = Game.market.getAllOrders({
      type:'ORDER_SELL',
      resourceType:'energy'
    });

  },
}
module.exports = market