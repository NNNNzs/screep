/**
 * 行为树节点状态
 */
export enum NodeStatus {
  SUCCESS = 'SUCCESS',    // 成功
  FAILURE = 'FAILURE',    // 失败
  RUNNING = 'RUNNING',    // 运行中
  READY = 'READY'        // 就绪
}

/**
 * 行为树节点基类
 */
export abstract class Node {
  protected status: NodeStatus = NodeStatus.READY;
  protected parent: Node | null = null;
  protected children: Node[] = [];

  constructor() {
    this.status = NodeStatus.READY;
  }

  abstract tick(creep: Creep): NodeStatus;

  addChild(child: Node): void {
    child.parent = this;
    this.children.push(child);
  }

  getStatus(): NodeStatus {
    return this.status;
  }

  reset(): void {
    this.status = NodeStatus.READY;
    this.children.forEach(child => child.reset());
  }
}

/**
 * 选择节点: 按顺序执行子节点,直到一个成功为止
 */
export class Selector extends Node {
  tick(creep: Creep): NodeStatus {
    for (const child of this.children) {
      const status = child.tick(creep);
      
      if (status === NodeStatus.RUNNING) {
        return NodeStatus.RUNNING;
      }
      
      if (status === NodeStatus.SUCCESS) {
        return NodeStatus.SUCCESS;
      }
    }
    return NodeStatus.FAILURE;
  }
}

/**
 * 序列节点: 按顺序执行所有子节点,直到全部成功
 */
export class Sequence extends Node {
  tick(creep: Creep): NodeStatus {
    for (const child of this.children) {
      const status = child.tick(creep);
      
      if (status === NodeStatus.RUNNING) {
        return NodeStatus.RUNNING;
      }
      
      if (status === NodeStatus.FAILURE) {
        return NodeStatus.FAILURE;
      }
    }
    return NodeStatus.SUCCESS;
  }
}

/**
 * 条件节点: 检查条件是否满足
 */
export abstract class Condition extends Node {
  abstract check(creep: Creep): boolean;

  tick(creep: Creep): NodeStatus {
    return this.check(creep) ? NodeStatus.SUCCESS : NodeStatus.FAILURE;
  }
}

/**
 * 动作节点: 执行具体行为
 */
export abstract class Action extends Node {
  abstract run(creep: Creep): NodeStatus;

  tick(creep: Creep): NodeStatus {
    return this.run(creep);
  }
}

/**
 * 装饰器节点: 修改子节点的行为
 */
export class Decorator extends Node {
  protected child: Node;

  constructor(child: Node) {
    super();
    this.child = child;
  }

  tick(creep: Creep): NodeStatus {
    return this.child.tick(creep);
  }
}

/**
 * 反转节点: 反转子节点的结果
 */
export class Inverter extends Decorator {
  tick(creep: Creep): NodeStatus {
    const status = this.child.tick(creep);
    
    if (status === NodeStatus.SUCCESS) {
      return NodeStatus.FAILURE;
    }
    if (status === NodeStatus.FAILURE) {
      return NodeStatus.SUCCESS;
    }
    return status;
  }
}

/**
 * 行为树管理器
 */
export class BehaviorTreeManager {
  private trees: Map<string, Node> = new Map();

  /**
   * 注册行为树
   */
  registerTree(name: string, root: Node): void {
    this.trees.set(name, root);
  }

  /**
   * 运行指定的行为树
   */
  runTree(name: string, creep: Creep): NodeStatus {
    const tree = this.trees.get(name);
    if (!tree) {
      throw new Error(`Behavior tree ${name} not found`);
    }
    return tree.tick(creep);
  }

  /**
   * 重置指定的行为树
   */
  resetTree(name: string): void {
    const tree = this.trees.get(name);
    if (tree) {
      tree.reset();
    }
  }
} 