# 策略原则与参考

完整的发展阶段、Empire/Colony/Cluster 控制模型、Tick 控制流程和落地路线见：[Screeps Bot 发展与控制策略](./development-and-control-strategy.md)。本文件保留具体的单房间经济原则，作为实现时的快速检查表。

## 本项目保留的策略原则

- Source 必须有固定所有者；Container 就绪后由固定 Miner 负责采集，不让采集者携带少量能量往返基地。
- 能量以房间需求请求驱动：Spawn/Extension 优先于 Tower，Tower 优先于普通建造、维修和升级。
- 低等级房间按每个 Source 周围实际可站立的采集格生成并绑定 Pioneer，一矿多点位；每个 Pioneer 持久化自己的 Source ID 与坐标。基础设施就绪后切换为 Miner、Hauler、Worker 的专职协作。
- Pioneer 携能后的首选建造目标是其绑定 Source 的 Container 工地；同一 Source 的 Pioneer 可共同预约该工地。工地完成、失效或不存在时，才按通用请求优先级支援其他目标。
- Source Container 必须建在该 Source 的可采集相邻格中，并以到 Spawn 交能范围的实际单房路径成本为首要选址依据；无法计算路径时使用稳定坐标顺序，避免随机选址。
- Miner 需求按已完成 Container 的 Source 逐个生成，不等待房间内所有 Container 完工；尚未完成的 Source 保留 Pioneer 采集与建造职责。
- 基础物流成型后固定补充一个 Upgrader；Worker 不再承接普通 Controller 升级，Upgrader 只在紧急补能时短暂让路，随后恢复升级。
- Worker 数量按当前建造/维修任务数扩展，最多 2 个；没有 Storage 时 Worker 取最近的 Source Container，这是 RCL1/RCL2 的正常短距离物流边界。
- Miner 只在缓存有空间时采集；Container 满并不代表 Miner 应继续尝试采集，Hauler 有可用目的地时负责清空缓存，否则 Miner 等待资源需求出现。
- Pioneer 一旦开始建造工地，就保持该建造预约；每 tick 消耗能量后优先回到同一工地，直到完成、失效或请求过期，不能因能量未满而重新采集。
- 当前预约不是绝对锁定：请求每 tick 重新参与优先级排序，紧急补能可以抢占升级或普通建造；紧急请求完成后，原请求失效则重规划，仍有效则恢复。
- 补能请求不采用单 Creep 独占预约；已有预约者无能量、移动失败或执行停滞时，其他携能 Creep 可以接管，避免 Spawn 断能。
- Pioneer 的采集策略是“未满载持续采集”；只有满载、Source 枯竭或已经开始建造时才离开采集位。采集位分配按距离 Spawn 的稳定顺序，存量 Creep 尚未绑定采集位时再按自身当前位置选择最近可用格。
- Spawn 保留最低自救储备；房间没有活动 Creep 时，无论普通需求计算是否为空，都优先生成一个最小 Pioneer 或 Miner。Controller 接近降级时暂停普通经济扩张，由升级请求接管工作优先级。
- BodyPlan 的成本预算必须先扣除 Spawn 自救储备；RCL1 的 300 能量 Spawn 不能规划出 300 成本 Miner 后再要求额外保留能量，最小 Miner 应在 200 能量预算下可生产。
- Spawn 依据角色能力缺口、房间能量预算、Source 数量与运输距离生成身体，不依赖固定人口常量。
- Memory 只持久化稳定 ID 和业务状态；观察结果、对象和短期路径留在 tick 或 Heap 范围。

## 开源与官方资料

- [Screeps 官方 API](https://docs.screeps.com/api/)：游戏规则、对象能力、返回码和 Memory/CPU 事实来源。
- [Overmind](https://github.com/bencbartlett/Overmind)：借鉴 Colony 内聚管理、请求式物流和 Link 网络思路，不复制其源码或完整战略体系。
- [Hivemind](https://github.com/Mirroar/hivemind)：借鉴 Kernel、Process、CPU 降级和错误边界思路，不复制其实现。
- [The International Screeps Bot](https://github.com/The-International-Screeps-Bot/The-International-Open-Source)：作为自动化问题清单参考，不复制源码。

第三方仓库仅作为设计参考。任何未来代码复用必须先核对许可证、来源和归属，并在提交中单独说明。
