# Team Capacity Allocation — Calculations and Table Data

**Date:** 04/2026
**Product / Service:** Kyma runtime (Hasselhoff)

---

## Team Composition and Total Capacity

| Role                | Hours/Week | FTE     |
| ------------------- | ---------- | ------- |
| Engineering Manager | 20         | 0.5     |
| Developer 1         | 40         | 1.0     |
| Developer 2         | 40         | 1.0     |
| Developer 3         | 40         | 1.0     |
| Developer 4         | 40         | 1.0     |
| **Total**           | **180**    | **4.5** |

---

## Mapping Work Buckets to Table Categories

The source data (Final Estimates from capacity-and-investment-ai-force.md) is mapped to the table categories below. Where multiple work buckets share the same table category, their percentages are summed.

### Regular Development

| Work Bucket                | Final % |
| -------------------------- | ------- |
| Regular Development        | 20%     |
| Technical Debt Elimination | 18%     |
| Quality and Testing        | 5%      |
| Documentation              | 3%      |
| **Total**                  | **46%** |

FTE = 46% × 4.5 = 2.07 → rounded to **2.1 FTE**
RTP = **No**

---

### Innovation and Research

| Work Bucket             | Final % |
| ----------------------- | ------- |
| Innovation and Research | 6%      |
| **Total**               | **6%**  |

FTE = 6% × 4.5 = 0.27 → rounded to **0.3 FTE**
RTP = **No**

---

### Software Maintenance

This category covers all run-the-platform operational buckets not captured by Cloud Operations, Security/Compliance, or Administration.

| Work Bucket          | Final % |
| -------------------- | ------- |
| Landscape Management | 5%      |
| OSS Upgrades         | 5%      |
| Customer Support     | 3%      |
| Bug Fixing           | 18%     |
| **Total**            | **31%** |

FTE = 31% × 4.5 = 1.40 → **1.4 FTE**
RTP = **Yes**

---

### Cloud Operations

| Work Bucket      | Final % |
| ---------------- | ------- |
| Cloud Operations | 5%      |
| **Total**        | **5%**  |

FTE = 5% × 4.5 = 0.23 → rounded to **0.2 FTE**
RTP = **Yes**

---

### Security and Compliance

| Work Bucket             | Final % |
| ----------------------- | ------- |
| Security and Compliance | 6%      |
| **Total**               | **6%**  |

FTE = 6% × 4.5 = 0.27 → rounded to **0.3 FTE**
RTP = **Yes**

---

### Administration

| Work Bucket         | Final % |
| ------------------- | ------- |
| Internal Enablement | 2%      |
| Administration      | 4%      |
| **Total**           | **6%**  |

FTE = 6% × 4.5 = 0.27 → rounded down to **0.2 FTE** (to keep total at 4.5)
RTP = **Yes**

---

### Other

| Work Bucket | Final % |
| ----------- | ------- |
| Other       | 0%      |
| **Total**   | **0%**  |

FTE = 0% × 4.5 = **0.0 FTE**
RTP = **—**

---

## Sanity Check

| Category                | %        | FTE (exact) | FTE (final) |
| ----------------------- | -------- | ----------- | ----------- |
| Regular Development     | 46%      | 2.07        | 2.1         |
| Innovation and Research | 6%       | 0.27        | 0.3         |
| Software Maintenance    | 31%      | 1.40        | 1.4         |
| Cloud Operations        | 5%       | 0.23        | 0.2         |
| Security and Compliance | 6%       | 0.27        | 0.3         |
| Administration          | 6%       | 0.27        | 0.2         |
| Other                   | 0%       | 0.00        | —           |
| **Total**               | **100%** | **4.50**    | **4.5**     |

---

## Table Entries (for Excel)

> **Header fields:**
>
> - Team name: `Hasselhoff`
> - Manager: _(your name)_
> - Team capacity including manager [FTE, HC-relevant]: `4.5`

| #   | Product / Service | Category                | RTP | Strategic Project / Initiative | Capacity [# FTE] | Additional capacity [# FTE-equivalent] | Description / Comments                                                 |
| --- | ----------------- | ----------------------- | --- | ------------------------------ | ---------------- | -------------------------------------- | ---------------------------------------------------------------------- |
| 7   | Kyma runtime      | Cloud Operations        | Yes |                                | 0.2              |                                        | Kyma Dashboard features                                                |
| 8   | Kyma runtime      | Regular Development     | No  |                                | 2.1              |                                        | Kyma Dashboard features                                                |
| 9   | Kyma runtime      | Innovation and Research | No  |                                | 0.3              |                                        | Kyma Dashboard features                                                |
| 10  | Kyma runtime      | Software Maintenance    | Yes |                                | 1.4              |                                        | Kyma Dashboard features / bug fixing                                   |
| 11  | Kyma runtime      | Security and Compliance | Yes |                                | 0.3              |                                        | Kyma Dashboard maintenance (modg, vulns, codeql)                       |
| 12  | Kyma runtime      | Administration          | Yes |                                | 0.2              |                                        | Setting up SKRs for additional validation (accessibility, UX, testing) |
|     |                   |                         |     | **Total**                      | **4.5**          | **0.0**                                |                                                                        |
