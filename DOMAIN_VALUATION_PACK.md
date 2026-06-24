# Expert Memo + AI Auditor Brief

> **版本：v6.6-R0d** | 高级导出参考；主输出见生成器双栏 UI

---

## 契约

```text
系统专家出价 → AI 审计系统价（AI_AUDITOR_JSON_v2）
```

---

## Expert Memo（DOMAIN_EXPERT_MEMO_v1）

- `buyer_personas[]` — 可审计买家画像
- `transaction_context` — 系统侧交易语境种子
- `system_valuation` — P1/P2/P3
- `comparable_anchors[]` — `allowed_for_audit: true`
- `ai_audit_tasks[]` — 含交易/法律尽调项

---

## AI Auditor（AI_AUDITOR_JSON_v2）

必填块：`transaction_status`、`dispute_check`  
verdict 含 **不可判定**  
禁止：`price_range`、`investor_floor_usd`、`suggested_price`

---

*v6.6-R0d · 2026-06-25*