
# Screeps 单房间经济 Bot

当前代码使用 Schema 3 的硬切换架构：RoomSnapshot 观察、房间请求账本、能力驱动 Spawn 与单动作 Creep Executor。

- 架构和手动验收步骤见 [docs/architecture.md](docs/architecture.md)。
- 策略原则和公开参考见 [docs/strategy-principles.md](docs/strategy-principles.md)。
- `pnpm run build` 只编译；上传、本地服务和 watch 由操作者手动启动。
