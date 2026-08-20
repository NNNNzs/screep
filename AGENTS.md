<!-- project-guide -->
# Screeps Bot 项目代理指南

## 项目索引

- `src/main.ts`：唯一运行入口，只负责启动 Kernel。
- `src/core/`：Tick 生命周期、Process 定义、CPU 调度和上下文。
- `src/memory/`：Schema 3 与全新初始化逻辑，不做旧 Memory 迁移。
- `src/world/`：从 `Game` 读取 RoomSnapshot，并只把稳定 ID、坐标和状态写入 Memory。
- `src/colony/`：请求规划、角色需求、Spawn、Link 网络和塔防进程。
- `src/creeps/`：Pioneer、Miner、Hauler、Worker 的显式单动作执行器。
- `src/types/`：Schema 3 全局 Memory/Creep 类型声明。
- `docs/architecture.md`：当前架构、运行边界和验收入口。
- `docs/strategy-principles.md`：提炼后的本项目策略原则和开源参考。
- `docs/development-and-control-strategy.md`：参考 Overmind/Hivemind 的发展阶段、Empire/Colony 控制模型和落地路线。
- `.agents/skills/screeps-strategy/`：Screeps 策略与架构任务的按需上下文路由 Skill。

## 工作约定

- 不要自动启动服务、watch、上传或部署命令；由用户手动启动和停止。
- 优先使用 `pnpm` 管理依赖和执行项目脚本。
- 设计文档放在 `docs/`，`AGENTS.md` 只维护目录索引、工程约定和验证入口。
- Screeps 的 Memory 只保存 JSON、ID、坐标、时间戳和业务状态，不保存 `Game` 对象、路径对象或完整结构对象。
- Schema 3 是全量切换，不建立旧 Memory 迁移器；不得擅自执行线上 Memory 清理或旧 Creep 删除。
- Creep 名称使用 `角色-房间-Game.time`；名称不得包含 `v3`、Schema 或架构版本，兼容性版本只保存在 Memory。
- 代码变更后至少运行 `pnpm run build`、`./node_modules/.bin/tsc --noEmit`、`node --check dist/main.js` 和 `git diff --check`。
- 修改范围外的工作区变更必须保留，不使用破坏性 Git 命令覆盖用户工作。
- 涉及具体库、SDK、CLI 或 API 的问题，先按下方 Context7 规则检索当前文档。

## 当前运行边界

新入口编译 `src/**/*.ts`。旧版源码已从工作树删除，只能通过 Git 历史回溯。Schema 3 上线前需要操作者手动确认并清空旧 Memory；代码本身不会执行这一步。

<!-- context7 -->
Use the `ctx7` CLI to fetch current documentation whenever the user asks about a library, framework, SDK, API, CLI tool, or cloud service — even well-known ones like React, Next.js, Prisma, Express, Tailwind, Django, or Spring Boot. This includes API syntax, configuration, version migration, library-specific debugging, setup instructions, and CLI tool usage. Use even when you think you know the answer — your training data may not reflect recent changes. Prefer this over web search for library docs.

Do not use for: refactoring, writing scripts from scratch, debugging business logic, code review, or general programming concepts.

## Steps

1. Resolve library: `npx ctx7@latest library <name> "<what to look up>"` — use the official library name with proper punctuation (e.g., "Next.js" not "nextjs", "Customer.io" not "customerio", "Three.js" not "threejs")
2. Pick the best match (ID format: `/org/project`) by: exact name match, description relevance, code snippet count, source reputation (High/Medium preferred), and benchmark score (higher is better). If results don't look right, try alternate names or queries (e.g., "next.js" not "nextjs", or rephrase the question)
3. Fetch docs: `npx ctx7@latest docs <libraryId> "<what to look up>"` — run a separate `docs` command per distinct concept if the question spans multiple topics, unless it's about how they interact
4. Answer using the fetched documentation

You MUST call `library` first to get a valid ID unless the user provides one directly in `/org/project` format. Be specific about what to look up in the library's documentation — specific and detailed queries return better results than vague single words, but keep each query to a single concept unless the question is about how concepts interact; combined multi-topic queries dilute ranking and return shallow results for each topic. Do not run more than 3 commands per question. Do not include sensitive information (API keys, passwords, credentials) in queries.

For version-specific docs, use `/org/project/version` from the `library` output (e.g., `/vercel/next.js/v14.3.0`).

If a command fails with a quota error, inform the user and suggest `npx ctx7@latest login` or setting `CONTEXT7_API_KEY` env var for higher limits. Do not silently fall back to training data.
Run Context7 CLI requests outside Codex's default sandbox. If a Context7 CLI command fails with DNS or network errors such as ENOTFOUND, host resolution failures, or fetch failed, rerun it outside the sandbox instead of retrying inside the sandbox.
<!-- context7 -->
