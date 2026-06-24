# SuperGrok 辩论协议 v2（含 /goal）

**生效**: 2026-06-23，v6.4 起强制执行  
**触发**: Joe 选择「用 /goal + 新协议从头跑」

---

## 与 v1 的区别

| v1（已废弃） | v2（本协议） |
|-------------|-------------|
| Grok 单人执行后代录共识 | 每轮必须真实 CLI 落盘 |
| 仅 `*_review.md` | R1 scope → R2 交叉辩论 → R3 锁版审阅 |
| todo 清单驱动 | `/goal` 跨轮持久目标 + `update_goal` 汇报 |
| 共识文件 = Grok 臆测 | FINAL 共识仅合并**真实文件** |

---

## 角色

| Agent | 职责 |
|-------|------|
| **Grok** | 写 task、并行调 CLI、合并共识、浏览器 E2E；**不代投、不越权 push** |
| **Hermes** | 源码逻辑审查、协调合并、**push 权限** |
| **Claude** | 独立审阅/辩论，落盘 |
| **OpenCode** | 独立审阅/辩论，落盘 |
| **MiMo** | 中文投资人视角，落盘 |

---

## 三轮辩论流程

```
Round 1 — 独立范围提案
  输入: *_planning_task_r1.md + 优先级参考文档
  输出: 20260623_{agent}_v64_scope_r1.md
  末尾: SCOPE_VOTE: APPROVED | NEEDS_CHANGES | REJECTED（对提议的 v6.4 打包方案）

Round 2 — 交叉辩论（读他人 R1）
  输入: 全部 *_scope_r1.md
  输出: 20260623_{agent}_v64_debate_r2.md
  内容: 同意点 / 争议点 / 修正后的统一优先级

Round 3 — 锁版审阅（实现后）
  输入: git diff + E2E 报告
  输出: 20260623_{agent}_v64_lock_review.md
  末尾: APPROVED | NEEDS_CHANGES | REJECTED
```

---

## 硬性约束

1. **TIMEOUT = ABSTAIN** — 不得无标注代录为已表决
2. **缺票计入统计** — 共识表必须显示 ABSTAIN/TIMEOUT 列
3. **Grok 禁止** — 伪造 `*_review.md`、未经 R3 就 push
4. **Hermes SIGTERM** — 连续 2 次超时后，记 ABSTAIN，3/4  Majority可推进（需 Joe 确认）
5. **版本锁** — push 前 `index.html` 版本号与 README 一致

## 多 Agent 上下文污染防护（v6.6+ 增补，Joe 2026-06-25）

1. **子 Agent 隔离** — 并行 Task 各带独立 prompt；不得把会话 summary 当投票
2. **FINAL 仅合并磁盘文件** — 无 `*_live_review.md` = 无票；Grok 总结 ≠ APPROVED
3. **禁止「规格已清楚」跳 Live** — 即使 Joe 裁决详尽，也须 retrospective 或先行 Live
4. **Grok Skill 强制** — 见 `~/.grok/skills/supergrok-debate/SKILL.md` + `domain/.grok/skills/supergrok-debate/SKILL.md`
5. **补救** — 独干后必须补 retrospective 四 Agent + `PROCESS_VIOLATION` 记录

---

## /goal 集成

每完成一个里程碑，Grok 调用 `update_goal(message: "...")` 汇报。  
仅当 M1–M7 全部完成时 `update_goal(completed: true)`。

---

## 文件命名

```
20260623_v64_planning_task_r1.md      # Grok 写
20260623_{claude,hermes,mimo,opencode,grok}_v64_scope_r1.md
20260623_{agent}_v64_debate_r2.md
20260623_v64_FINAL_consensus.md       # Grok 合并（仅真实票）
20260623_grok_v64_e2e.md
20260623_{agent}_v64_lock_review.md
```