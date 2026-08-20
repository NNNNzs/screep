# 策略原则与参考

## 本项目保留的策略原则

- Source 必须有固定所有者；Container 就绪后由固定 Miner 负责采集，不让采集者携带少量能量往返基地。
- 能量以房间需求请求驱动：Spawn/Extension 优先于 Tower，Tower 优先于普通建造、维修和升级。
- 低等级房间按每个 Source 周围实际可站立的采集格生成并绑定 Pioneer，一矿多点位；每个 Pioneer 持久化自己的 Source ID 与坐标。基础设施就绪后切换为 Miner、Hauler、Worker 的专职协作。
- Pioneer 携能后的首选建造目标是其绑定 Source 的 Container 工地；同一 Source 的 Pioneer 可共同预约该工地。工地完成、失效或不存在时，才按通用请求优先级支援其他目标。
- Source Container 必须建在该 Source 的可采集相邻格中，并以到 Spawn 交能范围的实际单房路径成本为首要选址依据；无法计算路径时使用稳定坐标顺序，避免随机选址。
- Spawn 依据角色能力缺口、房间能量预算、Source 数量与运输距离生成身体，不依赖固定人口常量。
- Memory 只持久化稳定 ID 和业务状态；观察结果、对象和短期路径留在 tick 或 Heap 范围。

## 开源与官方资料

- [Screeps 官方 API](https://docs.screeps.com/api/)：游戏规则、对象能力、返回码和 Memory/CPU 事实来源。
- [Overmind](https://github.com/bencbartlett/Overmind)：借鉴 Colony 内聚管理、请求式物流和 Link 网络思路，不复制其源码或完整战略体系。
- [Hivemind](https://github.com/Mirroar/hivemind)：借鉴 Kernel、Process、CPU 降级和错误边界思路，不复制其实现。
- [The International Screeps Bot](https://github.com/The-International-Screeps-Bot/The-International-Open-Source)：作为自动化问题清单参考，不复制源码。

第三方仓库仅作为设计参考。任何未来代码复用必须先核对许可证、来源和归属，并在提交中单独说明。
