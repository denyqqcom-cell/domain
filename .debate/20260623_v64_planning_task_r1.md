# Round 1 — v6.4 范围辩论任务

**时间**: 2026-06-23  
**协议**: `20260623_agent_debate_protocol_v2.md`  
**基线**: v6.3.1 @ `7a10255`

---

## 背景

v6.3.1 已锁版。现启动 **v6.4**，采用 SuperGrok 三轮辩论 + `/goal` 跨轮推进。

请先阅读以下参考（不必全部精读，但须引用具体条目）：

| 文件 | 内容 |
|------|------|
| `20260622_claude_next_priority.md` | Hermes 整理的 v6.3.2 P0/P1/P2 技术债 |
| `20260622_mimo_next_priority.md` | 中文投资人视角：888/420 数字评分为 P0 |
| `20260619_claude_lock.md` §v6.4+ | 批量评估、P2/P3 floor guard |
| `/home/joe/domain/CHANGELOG_v6.3_PLAN.md` | v6.3「不做的事」5 项 |
| `/home/joe/domain/index.html` | 当前实现（版本 v6.3.1） |

---

## 请各 Agent 回答（独立判断，勿假设他人已表态）

### 1. v6.4 应包含什么？

从候选池中选择并排序（可增删）：

**A. 技术债闭环**（cloud.com 锚点、score6D 清理、acquirable 说明、回归表、key_reasons、badge、fixtures…）  
**B. 产品增量**（批量评估、BLACKLIST 半自动扩充、P2/P3 floor guard）  
**C. 中国市场**（888/420 数字质量 + 吉利加分）  
**D. 维持排除**（非 .com/.ai、AI 评委面板）

### 2. 你的推荐 v6.4 Sprint 打包方案

给出具体条目清单 + 预估工时 + 风险。

### 3. 与 v6.3.2 的关系

v6.3.2 未单独发版。是否将 P0 技术债**并入 v6.4 前置条件**？理由？

### 4. 回归门禁

列出 v6.4 锁版前必须通过的域名/用例（至少包含 v6.3.1 五域名基准）。

### 5. 流程改进建议

对 SuperGrok 辩论协议 v2 或 `/goal` 有何补充？

---

## 输出要求

将完整回答写入：

```
/mnt/f/3agent辩论/domain_project/20260623_{你的agent名}_v64_scope_r1.md
```

**末尾必须单独一行**（机器可读）：

```
SCOPE_VOTE: APPROVED
```
或 `NEEDS_CHANGES` 或 `REJECTED`

若你反对启动 v6.4 而主张先做 v6.3.2，写 `REJECTED` 并说明替代方案。

---

## Grok 协调说明

- Grok **不代写**其他 Agent 文件
- 本任务发出后，Grok 并行调用 Claude / Hermes / OpenCode / MiMo CLI
- Hermes 超时 → 标 ABSTAIN，不代录