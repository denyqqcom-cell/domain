# Domain Investment Expert System v6.6-R0d

> 域名投资专家系统 · 系统专家出价 → AI 审计复核 · 资产类别优先

🔗 **在线使用**：https://denyqqcom-cell.github.io/domain/

---

## 产品契约（v6.6-R0 LOCK）

| 角色 | 职责 |
|------|------|
| **系统** | P1/P2/P3 估值假设、Expert Memo、交易语境、可比锚点 |
| **AI** | 联网**复核**系统价格；先 transaction/dispute 尽调，再 verdict |
| **用户** | 左栏系统专家三档估值 / 右栏 AI 复核结论卡（粘贴 JSON） |

---

## 功能表

| 功能 | 说明 |
|------|------|
| 三档价格 | P1/P2/P3 数值区间；左栏「系统专家三档估值」为唯一价源 |
| Top Numeric 2N–5N | 888.com / 88888.com 等 subtype_detail |
| Buyer Persona | 可审计买家卡 + Expert Memo `buyer_personas[]` |
| Transaction DD | `transaction_context` + AI `transaction_status` |
| Legal DD | AI `dispute_check`（UDRP/商标） |
| AI Auditor | `AI_AUDITOR_JSON_v2`；右栏结论卡 + JSON 折叠 |
| 门禁 | `v66` + `v66_r0c` + `v66_r0c0` + `v66_r0d` |

---

## 快速使用

1. 输入域名 →「生成专家估值」
2. 左栏查看系统专家三档估值与 AI 核验项
3. 复制「AI 审计合同」→ 投喂 AI（见 `AGENT_PROMPTS.md`）
4. 将 AI 返回 JSON 粘贴右栏 →「渲染复核结论」

---

## 版本链

```text
v6.6-R0c     c5d5251   ACCEPTED  Transaction & Legal DD
v6.6-R0d     CURRENT   文档债 + 2N/4N judgment + paste JSON 抛光
v6.6-R0e     待启动     API wire（R0d defer）
R1.1 / R2    暂缓
```

---

## 验收门禁

```bash
node test/v66_r0_gate.js      # 42/42
node test/v66_r0c_gate.js       # 17/17
node test/v66_r0c0_gate.js      # 23/23
node test/v66_r0d_gate.js       # R0d
```

---

## 发布说明

- **GitHub main / Pages** 标题应为 `v6.6-R0d`
- `v64_regression.js` 为 @legacy，不作签核依据