# Expert Memo + AI Auditor Brief（导出模板）

> **版本：v6.6-R0b** | Domain Investment Expert System  
> **状态**：`DOMAIN_VALUATION_PACK.md` 已降级为高级导出参考；**主输出**为生成器内 Expert Memo + AI Auditor Brief。

---

## 产品契约

```text
系统专家出价 → AI 审计系统价（不得重新估值）
```

用户应复制生成器中的 **「复制 AI 审计合同」** JSON，配合 `AGENT_PROMPTS.md` 中的 Auditor 提示词投喂 AI。

---

## Expert Memo 结构（DOMAIN_EXPERT_MEMO_v1）

| 区块 | 字段 |
|------|------|
| 资产画像 | `asset_class`, `tags`, `subtype_detail` |
| 专家观点 | `one_liner`, `pattern_judgment`, `system_score` |
| 系统估值 | `price_lens.p1/p2/p3`（始终数值区间） |
| 假设 | `valuation_assumptions[]` |
| 可比锚点 | `comparable_anchors[]`（`allowed_for_audit: true`，同类过滤） |
| AI 任务 | `ai_audit_tasks[]` |

---

## AI Auditor Brief（AI_AUDITOR_JSON_v1）

输出字段：`audit_score`, `p1/p2/p3_verdict`, `top_evidence[]`（含 `source_url` / `source_tier` / `verified_status`）, `correction_suggestion`, `confidence`

**禁止**：`price_range`, `investor_floor_usd`, 独立六维分重算

---

## 历史说明

v6.5 及更早版本的「估值顾问」「17 条规则投喂」Markdown 包已废弃。  
引擎规则（67 条、六维、ANCHORS）仍有效，但前台主输出为专家结论 + 审计合同。

*模板 v6.6-R0b · 2026-06-25*