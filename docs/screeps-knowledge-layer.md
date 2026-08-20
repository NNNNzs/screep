# Screeps 知识层与策略资料调研

> 状态：已完成首轮调研
>
> 目的：把游戏规则、Bot 架构经验和 Agent 上下文组织方式分开，减少每次任务重复加载大段资料。

## 1. 结论摘要

Context7 已收录 Screeps 文档，当前可用的主要索引是 `/websites/screeps`，覆盖 API、Global Objects、Memory、RawMemory、CPU、Creep、Spawn、PathFinder、Defense、Market 和 Game Loop。查询时应先用 `ctx7 library "Screeps" "具体问题"`，再针对一个问题查询 `ctx7 docs /websites/screeps "..."`。

互联网没有发现一个成熟、专门面向 Screeps 的通用 Codex/Agent Skill。公开资料主要分成三类：官方文档、成熟 Bot 源码、通用 Agent Skill 规范。因此本项目采用“官方文档做事实源、成熟 Bot 做架构参考、项目 Skill 做上下文路由”的组合，不直接复制第三方 Bot 的实现。

## 2. Context7 能提供什么

### 2.1 已验证的索引

| Context7 ID | 用途 | 选择理由 |
| --- | --- | --- |
| `/websites/screeps` | 官方 Screeps 文档和 API 片段 | 片段数量最多，覆盖策略所需的 Game API 和玩法文档 |
| `/websites/screeps_api` | API 参考补充 | 适合查对象、方法、返回码和参数 |
| `/screeps/docs` | `screeps/docs` GitHub 文档镜像 | 适合核对官方文档仓库的具体页面 |

不要把 Context7 返回的整篇文档保存到项目 Memory。它应该只在当前问题需要 API 事实时按主题查询，并把稳定结论沉淀到本文件或架构文档。

### 2.2 推荐查询主题

```text
Screeps Memory and RawMemory segments: persistent JSON, object IDs, active segments, serialization cost
Screeps CPU bucket and tickLimit: scheduler degradation and low-priority work
Screeps Creep body parts and spawnCreep: energy cost, capability, and role body planning
Screeps moveTo reusePath and PathFinder: CPU-aware movement and cache boundaries
Screeps towers and defense: attack, heal, hostile prioritization, and energy constraints
```

每次只查询一个主题。API 签名、返回码和版本差异以 Context7/官方文档为准；策略选择和本项目边界以架构文档与 Skill 为准。

## 3. 对 V2 架构的直接影响

### 3.1 Memory 与缓存

官方文档的稳定原则是：Memory 是持久化 JSON，游戏对象应保存 ID，再用 `Game.getObjectById` 恢复；当前 Tick 的对象和昂贵计算适合放 Heap/Global。V2 已经采用这条边界，下一步应补充：

- `RoomSnapshot`：当前可见房间的短生命周期事实，不直接持久化；
- `RoomIntel`：跨 Tick 的少量房间情报，带 `lastSeen`、来源和 TTL；
- `CostMatrix`：Heap 缓存，按房间和地形版本失效；
- `BodyPlan`：由角色需求、能量预算和 RCL 计算出的临时结果，不写入全局任务 Memory；
- `RequestLedger`：房间级需求，保留稳定请求 ID、优先级、目标 ID、数量和过期时间。

### 3.2 CPU 调度

CPU 文档和成熟 Bot 都支持把业务拆成不同频率的 Process。V2 Scheduler 已有 `interval`、`priority`、`minBucket`、`requireSegments` 和 `maxCpu`，后续应增加按房间规模和剩余 CPU 的动态降级：

```text
Always: defense, spawn safety, current creep action
High: visible room observation, energy logistics, controller safety
Normal: construction, layout, economy, remote planning
Low: market, long-term intel, visuals, statistics
```

低 bucket 时应减少扫描范围、降低路径规划频率、暂停远程和市场，而不是让所有 Creep 同时失去执行机会。

### 3.3 Creep 与生产策略

官方 API 的 body part 成本和能力适合被建模为数据，而不是散落在角色函数中。建议增加：

- `RoleDemand`：每个房间当前需要多少采集、运输、建造和升级能力；
- `BodyPlan`：根据可用能量、RCL、路程和工作量生成 body；
- `SpawnRequest`：带优先级、原因、房间和过期时间的生产请求；
- `CreepCapability`：由 body 实时推导的 WORK/CARRY/MOVE/战斗能力。

这样可以避免“固定数量 Creep”策略在房间扩张、道路改变或受到攻击时失真。

### 3.4 移动与路径

官方 API 的 `moveTo` 支持路径复用，路径会进入 Creep 的特殊移动 Memory。项目不应再建立第二套长期路径序列化系统；应先使用原生 `reusePath`，只有在 CostMatrix 或跨房间路径确实成为 CPU 瓶颈时，才引入 Heap 缓存或 Segment 方案。

跨房间移动应拆为两层：`Game.map.findRoute` 负责房间级路线，`PathFinder.search` 负责当前可行走区域和 CostMatrix。这样可将跨房间战略规划与单房间执行分开。

### 3.5 防御与威胁

防御不应只是“发现 hostile 就 attack”。应把 `hostileCount`、敌方 body 能力、tower 能量、己方受伤单位、关键建筑和房间 RCL 组合成 `ThreatSnapshot`，再产生高优先级防御请求。塔的 attack/heal 作为 Always Process，敌情分析和撤退/反击规划可以低频执行。

## 4. GitHub 公开项目的可借鉴内容

| 项目 | 可借鉴 | 不直接复制 |
| --- | --- | --- |
| [screepers/screeps-typescript-starter](https://github.com/screepers/screeps-typescript-starter) | TypeScript、Rollup、类型和最小入口的工程基线 | 不把 starter 当业务架构 |
| [bencbartlett/Overmind](https://github.com/bencbartlett/Overmind) | Colony、Overlord、Overseer、Directive 的领域分层；每个 Colony 内聚管理 Creep | 不复制完整 Zerg/战略体系，避免当前项目过度复杂 |
| [Mirroar/hivemind](https://github.com/Mirroar/hivemind) | Kernel、Process、CPU 调度、Segmented Memory、错误边界 | 不引入全部框架；只按当前 Bot 的 CPU 和规模实现 |
| [TooAngel/screeps](https://github.com/TooAngel/screeps) | 自动建造、远程采集、房间复活、市场、Visual、手动命令和测试框架等成熟问题清单 | 仓库为 AGPL-3.0，任何代码复制前必须进行许可证审查 |
| [screeps/docs](https://github.com/screeps/docs) | 官方 API 文档源和页面结构 | 以官方文档为事实源，不以第三方博客替代返回码核对 |

成熟 Bot 的共同启示不是“照抄目录”，而是把战略刺激、房间管理、角色能力、请求/指令和执行动作分离，并提供 Visual/统计/手动控制来观察长期运行结果。

## 5. Agent Skill 调研结果

### 5.1 没有发现可直接安装的 Screeps 专用 Skill

公开搜索没有发现一个维护良好、明确面向 Screeps API 和 Bot 策略、可直接用于 Codex 的通用 `SKILL.md`。搜索结果主要是通用 Agent Skill 规范、Screeps Bot 源码和 Screeps-like 游戏 Skill，不能作为本项目的直接依赖。

### 5.2 项目解决方案

已创建项目 Skill：`.agents/skills/screeps-strategy/SKILL.md`。

它只保存以下高价值路由信息：

- 何时读取哪份项目文档；
- 何时调用 Context7 查 API；
- Memory、观察/规划/执行、CPU 和旧版隔离边界；
- 如何把策略问题拆成房间、需求、能力、动作和失败重试。

完整 API 细节不放进 Skill，避免每次触发都消耗上下文；完整策略资料也不放进 `AGENTS.md`，而是按需读取本文件和架构文档。

## 6. 推荐的后续架构增量

按收益/复杂度排序：

1. 增加 `RoomSnapshot`、`ThreatSnapshot`、`RoleDemand` 和 `BodyPlan` 类型，先让现有 Colony/Spawn 使用数据模型。
2. 将当前固定 Spawn 数量改为 `RoleDemand -> SpawnRequest -> BodyPlan`。
3. 引入 Heap Cache 层，统一缓存 `Game.getObjectById`、CostMatrix 和短期路线，所有缓存必须允许丢失并带 TTL/版本。
4. 将防御从塔攻击扩展为 ThreatSnapshot 和高优先级防御请求。
5. 增加 `src/v2/strategy/`，只负责跨房间目标和资源分配，不直接操作 Creep。
6. 增加 `src/v2/intel/`，用 TTL 管理不可见房间情报；需要大容量时再设计 Segment Manager。
7. 增加 Screeps 沙盒或最小 Mock 测试，验证 Scheduler、Memory schema、BodyPlan 和 RequestLedger，而不是只验证 Rollup。

## 7. Agent 的低 Token 工作协议

```text
任务分类
  -> API 事实问题：Context7 查询一个主题
  -> 策略问题：读取本文件相关小节
  -> 架构问题：读取 architecture-v2.md 对应章节
  -> 实现问题：只读取 src/v2 相关模块
  -> 行为回归：按需读取 legacy 模块，不默认全量读取
```

每次回答应明确：使用了哪条官方规则、哪条项目架构约束、哪些内容是策略推断。不要把 Context7 原文、整个 GitHub README 或整个代码库复制进上下文。

## 8. 资料入口

- [Screeps 官方文档](https://docs.screeps.com/)
- [Screeps API 文档](https://docs.screeps.com/api/)
- [Global Objects / Memory](https://docs.screeps.com/global-objects.html)
- [CPU Limit](https://docs.screeps.com/cpu-limit.html)
- [Caching Overview](https://docs.screeps.com/contributed/caching-overview.html)
- [PathFinder](https://docs.screeps.com/api/#PathFinder)
- [Context7 Screeps 索引](https://context7.com/websites/screeps)
- [Context7 CLI 文档](https://context7.com/docs/clients/cli)
