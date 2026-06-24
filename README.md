# Domain Investment Expert System v6.6-R0a

> 域名投资专家系统 · 系统专家出价 → AI 审计复核 · 资产类别优先

🔗 **在线使用**：https://denyqqcom-cell.github.io/domain/

---

## 产品契约（v6.6-R0）

| 角色 | 职责 |
|------|------|
| **系统** | 形成 P1/P2/P3 估值假设、专家 Memo、可比锚点 |
| **AI** | 联网审计系统价格（偏低/合理/偏高），**不得重新估值** |
| **用户** | 看双结论：左栏系统专家 / 右栏 AI 复核 |

---

## 功能表

| 功能 | 说明 |
|------|------|
| 资产类别优先判定 | NN_COM / NNN_COM / NNNNN_COM / LL_COM / ULTRA_WORD_COM 等 |
| 六维评分框架 | TLD强度 / 终端匹配 / 域名品质 / 市场定价 / 市场热度 / Outbound |
| 三档价格输出 | P1 投资人流通 / P2 挂牌议价 / P3 战略终端假设价（始终数值区间） |
| Top Numeric 拆桶 | 2N–5N 数字品相（888.com → `all_8_repeat_nnn`；88888.com → `all_8_repeat`） |
| 可比锚点过滤 | `comparable_anchors` 按 asset_class 强过滤，`allowed_for_audit: true` |
| Expert Memo | `DOMAIN_EXPERT_MEMO_v1` + `ai_audit_tasks[]` |
| AI Auditor Contract | `AI_AUDITOR_JSON_v1`（含 source_url / source_tier / verified_status） |
| 双栏 UI | 系统专家估值 + AI 复核占位 |

---

## 快速使用

1. 打开在线页面，输入域名（如 `888.com`、`41235.com`、`hd.com`）
2. 查看左栏系统专家估值（P1/P2/P3 + 专家一句话 + AI核验项）
3. 复制「Expert Memo + AI Auditor Brief」投喂 AI 复核员
4. AI 输出审计 JSON，填入右栏（联网能力后续接入）

---

## 版本链

```text
v6.5-R0f / R1-hotfix   ACCEPTED  价格引擎底座
v6.6-R0                ACCEPTED  产品契约（Expert + Auditor）
v6.6-R0a               CURRENT   数字品相 2N–5N + 锚点过滤
v6.5-R1.1 / R2         暂缓
```

---

## 验收门禁

运行：`node test/v66_r0_gate.js`

| 域名 | 关键验收 |
|------|----------|
| 888.com | NNN_COM + all_8_repeat_nnn + AAA豹子号；无 NFTs/cloud 跨品类锚点 |
| 41235.com | NNNNN_COM + 含4 + P1/P2/P3 数值 |
| 88888.com | all_8_repeat + P1 $180K–$450K |
| hd.com | LL_COM + 缩写语义 |
| text.com | ULTRA_WORD_COM |

---

## 发布说明

- **GitHub main** `index.html` 标题应为 `v6.6-R0a`
- **GitHub Pages** 若仍显示旧版，检查 Pages 分支/缓存（硬刷新 Ctrl+Shift+R）