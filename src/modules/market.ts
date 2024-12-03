/**
 * 市场交易配置接口
 */
interface MarketConfig {
  /** 各资源的最低库存配置 */
  minReserves: {
    [resourceType: string]: number;
  };
  /** 价格偏差阈值（相对于市场均价的百分比） */
  priceThreshold: number;
}

/**
 * 市场管理模块
 */
export class MarketManager {
  private config: MarketConfig;

  constructor(config: MarketConfig) {
    this.config = config;
  }

  /**
   * 运行市场管理逻辑
   */
  public run(): void {
    this.autoSell();
  }

  /**
   * 自动售货逻辑
   */
  private autoSell(): void {
    // 获取所有房间
    for (const roomName in Game.rooms) {
      const room = Game.rooms[roomName];
      if (!room.controller?.my) continue;

      // 获取储存设施
      const storage = room.storage;
      if (!storage) continue;

      // 检查每种资源
      for (const resourceType in storage.store) {
        this.handleResource(room, resourceType as ResourceConstant);
      }
    }
  }

  /**
   * 处理单个资源的售卖
   * @param room - 房间对象
   * @param resourceType - 资源类型
   */
  private handleResource(room: Room, resourceType: ResourceConstant): void {
    const storage = room.storage;
    if (!storage) return;

    const currentAmount = storage.store[resourceType] || 0;
    const minReserve = this.config.minReserves[resourceType] || 0;

    // 检查是否有足够的资源可以出售
    if (currentAmount <= minReserve) return;

    // 计算可出售数量
    const amountToSell = currentAmount - minReserve;

    // 获取市场均价
    const avgPrice = this.getAveragePrice(resourceType);
    if (!avgPrice) return;

    // 计算我们的目标售价（略低于市场均价以确保能售出）
    const targetPrice = avgPrice * (1 - this.config.priceThreshold);

    // 检查是否已有相同的订单
    const existingOrders = Game.market.orders;
    const hasExistingOrder = Object.values(existingOrders).some(
      order => order.roomName === room.name &&
        order.resourceType === resourceType &&
        order.type === ORDER_SELL
    );

    if (!hasExistingOrder) {
      // 创建新的售卖订单
      Game.market.createOrder({
        type: ORDER_SELL,
        resourceType: resourceType,
        price: targetPrice,
        totalAmount: amountToSell,
        roomName: room.name
      });
    }
  }

  /**
   * 获取资源的市场均价
   * @param resourceType - 资源类型
   * @returns 市场均价
   */
  private getAveragePrice(resourceType: ResourceConstant): number | null {
    const history = Game.market.getHistory(resourceType);
    if (!history || history.length === 0) return null;

    // 计算最近5天的均价
    const recentHistory = history.slice(-5);
    const avgPrice = recentHistory.reduce((sum, day) => sum + day.avgPrice, 0) / recentHistory.length;

    return avgPrice;
  }
}
