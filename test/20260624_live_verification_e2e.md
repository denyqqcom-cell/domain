# Grok — 实时市场核验 E2E 测试报告

**时间**: 2026-06-24  
**执行**: Grok Build（curl + RDAP + who.is + Afternic/Sedo 页面抓取）  
**测试域名**: 1888.COM（主样本）· 8888.COM（对照组）  
**关联文件**:
- `DOMAIN_VALUATION_PACK.md`（已回写实时数据）
- `data/live_verification_1888.json`
- `data/live_verification_8888.json`

---

## 测试目标

验证 Domain AI Judge 物料包在 **live_market_checked: true** 模式下：
1. 只写入有溯源的事实，不编造成交/挂牌价
2. 正确更新 `domain_status`、`acquirable`、待核实清单
3. `final_score` 保持锁定（1888 = 83）
4. 对照组 8888.com 可区分同类 NNNN_COM 的不同运营状态

---

## 1888.COM — 主样本核验

| 核验项 | 结果 | 来源 | 状态 |
|--------|------|------|------|
| RDAP 注册信息 | 2001-06-01 注册，2035-06-01 到期，GoDaddy | Verisign + GoDaddy RDAP | ✅ |
| 持有人 | Domains By Proxy, LLC | GoDaddy RDAP | ✅ |
| 域名锁 | 四重 clientProhibited | RDAP | ✅ |
| DNS A | 192.9.134.65 / 147.224.39.162 | who.is DNS | ✅ |
| www CNAME | redirect-js.app | who.is DNS | ✅ |
| HTTP 建站 | 200 OK，nginx，spinner 页 | 直连 curl | ✅ |
| domain_status | **parked** | 综合判定 | ✅ |
| Afternic | 可经纪，**无标价** | afternic.com/forsale/1888.com | ✅ |
| Sedo | **无挂牌** | sedo.com/search?q=1888.com | ✅ |
| NameBio | **IP 被封** | namebio.com/1888.com | ⚠️ blocked |
| 自身 verified 成交 | **未发现** | — | ✅ 如实标注 |
| final_score | **83（锁定）** | 材料包规则 | ✅ |

---

## 8888.COM — 对照组核验

| 核验项 | 结果 | 来源 | 状态 |
|--------|------|------|------|
| RDAP 注册信息 | 1998-03-19 注册，2034-03-18 到期 | Verisign RDAP | ✅ |
| 持有人 | Domains By Proxy, LLC | GoDaddy RDAP | ✅ |
| 域名锁 | 四重 clientProhibited | RDAP | ✅ |
| DNS A | 104.21.67.88 / 172.67.219.34（Cloudflare） | who.is DNS | ✅ |
| MX | 8888-com.mail.protection.outlook.com | who.is DNS | ✅ |
| www CNAME | 无 redirect-js.app | who.is DNS | ✅ |
| HTTP | 200 OK，cloudflare | 直连 curl | ✅ |
| Afternic | 可经纪，**无标价** | afternic.com/forsale/8888.com | ✅ |
| Sedo | **无挂牌** | sedo.com/search?q=8888.com | ✅ |
| 参考锚点 | €400K bid（2013，DomainNameWire） | reference_only | ✅ 未用于定价 |

### 1888 vs 8888 关键差异（事实层）

| 维度 | 1888.COM | 8888.COM |
|------|----------|----------|
| 注册年 | 2001 | 1998（更早） |
| 建站形态 | redirect-js.app parking | Cloudflare 直连 + MX |
| 企业邮 | 无 MX | 有 Outlook MX |
| 文化溢价（推断，非定价依据） | 发发发发 | 四八（更强） |

---

## 规则合规检查

| 规则 | 检查 | 结果 |
|------|------|------|
| final_score 锁定 | 1888 = 83，未因 live 数据修改 | ✅ |
| 无 verified 成交不编造 | 1888/8888 均无本次可引用成交价 | ✅ |
| reference_only 锚点不参与定价 | 8888 €400K bid 仅标注 | ✅ |
| acquirable 三态 | 1888 = unknown（有依据） | ✅ |
| fact / inference / missing 分层 | 见 JSON 附件 | ✅ |
| 每条 [market] 有 URL 来源 | RDAP/who.is/Afternic/Sedo | ✅ |

---

## 仍缺失（不得补编）

- NameBio 历史成交（IP blocked）
- DNJournal 排名
- USPTO/WIPO 商标
- 持有人真实身份与出售意愿
- 活跃询盘
- 8888.com 页面品牌内容（WebFetch 返回空，不得推断建站用途）

---

## 交付物清单

| 文件 | 路径 |
|------|------|
| 更新后物料包 | `DOMAIN_VALUATION_PACK.md` |
| 1888 结构化核验 | `data/live_verification_1888.json` |
| 8888 对照组 | `data/live_verification_8888.json` |
| 本 E2E 报告 | `test/20260624_live_verification_e2e.md` |

---

**判定: LIVE VERIFICATION E2E PASS（部分）**

- 可溯源事实：✅ 已写入物料包
- 未核验项：✅ 已明确标注，未编造
- 对照组：✅ 8888.com 已完成
- NameBio：⚠️ 待换 IP 或人工补查