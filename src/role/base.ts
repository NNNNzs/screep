/**
 * Role基类
 * @description 所有Role的基类，提供基础方法
 */
export default class BaseRole {
  protected creep: Creep;

  constructor(creep: Creep) {
    this.creep = creep;
  }

  /**
   * 运行Role的主要逻辑
   */
  public run(): void {
    throw new Error('Method not implemented.');
  }

  /**
   * 静态run方法，用于创建实例并执行
   */
  public static run(creep: Creep): void {
    const instance = new this(creep);
    instance.run();
  }
}
