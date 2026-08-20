<!-- project-guide -->
# Screeps Bot 项目代理指南

## 项目索引

- `src/main.ts`：唯一运行入口，只负责启动 V2 Kernel。
- `src/v2/core/`：Tick 生命周期、Process 定义、CPU 调度和上下文。
- `src/v2/memory/`：V2 Memory schema 与全新初始化逻辑，不做旧版 Memory 迁移。
- `src/v2/world/observer/`：从 `Game` 读取房间事实，只把 ID、坐标和状态写入 Memory。
- `src/v2/empire/`：Empire、Colony、Spawn、Defense 进程。
- `src/v2/creeps/`：显式 Creep Executor 和有限动作实现。
- `src/v2/types/`：V2 全局 Memory/Creep 类型声明。
- `src/modules/`、`src/role/`、`src/behavior/`、`src/task/`：旧版参考代码，不得从新入口重新接入。
- `docs/architecture-v2.md`：V2 架构、Memory 设计、上线边界和实施计划。
- `docs/screeps-knowledge-layer.md`：Context7、官方文档和 GitHub Bot 调研结论，以及低 token 知识层设计。
- `.agents/skills/screeps-strategy/`：Screeps 策略与架构任务的按需上下文路由 Skill。

## 工作约定

- 不要自动启动服务、watch、上传或部署命令；由用户手动启动和停止。
- 优先使用 `pnpm` 管理依赖和执行项目脚本。
- 设计文档放在 `docs/`，`AGENTS.md` 只维护目录索引、工程约定和验证入口。
- Screeps 的 Memory 只保存 JSON、ID、坐标、时间戳和业务状态，不保存 `Game` 对象、路径对象或完整结构对象。
- V2 是全量切换，不建立旧 Memory 迁移器；不得擅自执行线上 Memory 清理或旧 Creep 删除。
- 代码变更后至少运行 `pnpm run build`、`./node_modules/.bin/tsc --noEmit`、`node --check dist/main.js` 和 `git diff --check`。
- 修改范围外的工作区变更必须保留，不使用破坏性 Git 命令覆盖用户工作。
- 涉及具体库、SDK、CLI 或 API 的问题，先按下方 Context7 规则检索当前文档。

## 当前运行边界

新入口只编译 `src/main.ts` 与 `src/v2/**/*.ts`。旧版源码保留作行为参考，但不应进入 V2 bundle。V2 上线前需要操作者手动确认并清空旧 Memory；代码本身不会执行这一步。

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
