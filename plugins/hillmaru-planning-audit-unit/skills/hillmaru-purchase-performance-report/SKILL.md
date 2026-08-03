---
name: hillmaru-purchase-performance-report
description: Generate the 힐마루(동훈 그룹 기획감사팀) purchase-performance PowerPoint report from a raw multi-year purchase-data Excel export ("구매_데이터_20XX_20XX상반기.xlsx" or similar "구매 실적 취합" file). Use whenever the user uploads a purchase/procurement Excel for 힐마루 (포천, 창녕, etc.) and asks for a PPT report, or mentions "구매 실적 보고", "구매계획 결과보고", "품목구분별/업체별 집행금액 보고서", "구매전략 매트릭스" — even without spelling out every slide, since this skill already encodes the exact structure, data-cleaning rules, and design system worked out with the user. One 사업장(site) = one separate deck.
---

# 힐마루 구매 실적 보고서 (Purchase Performance Report)

This skill was built iteratively with the user across many rounds of real feedback. The
`scripts/` folder contains a **working, tested pipeline** (Python pandas → JSON → pptxgenjs) that
already produces the agreed-upon 21-slide deck for 포천. Prefer adapting these scripts over
regenerating the logic from scratch — they encode a lot of hard-won data-cleaning and layout
fixes that are easy to reintroduce as bugs if rewritten from memory.

## Quick start

```
cp scripts/*.py scripts/*.sh scripts/*.js scripts/*.json <workdir>/
cd <workdir>
# 1. edit prep_data.py: set SRC to the actual uploaded file path
# 2. if the target 사업장 isn't 포천, see "Adapting to a different site" below
bash run_all.sh
```

`run_all.sh` runs the full pipeline in the only order that works (see "Pipeline gotcha" below)
and ends with `validate.py` on the output. Then follow the `pptx` skill's QA process (render to
images, sanity-check) before delivering — note the visual-QA limitation below.

## Input data & known schema drift

Raw export is **one workbook, one sheet per year** (`2023`, `2024`, `2025`, `2026 상반기`, or
similar). Read every year-sheet present. Header is on row 3 (`header=2` in pandas).

**2023's sheet uses different column names and is missing 과목3 entirely** — confirmed:

| Field | 2023 sheet | 2024+ sheets |
|---|---|---|
| 과목1 | `구분1` | `과목1` |
| 과목2 | `구분2` | `과목2` |
| 과목3 (품목구분) | **empty** — `구분2`'s value plays this role, with different naming (`저장품_스프링클러` vs `스프링클러(SK)`) | populated |
| 입고일 | `입고요청일` | `입고일` |
| 요청부서 | empty | populated |

`prep_data.py` normalizes all of this into one common schema and concatenates every year into
`all_raw.pkl`, tagging each row with `period_label` (the sheet name). `공급가` occasionally holds
a non-numeric placeholder (`-`) or is blank for cancelled/adjusted lines — these get coerced to
numeric and dropped, never silently included as 0 or crashing a sum.

## Category normalization — do this every run, it matters a lot

Three separate normalization passes happen, in this order, and **all three are necessary** —
each one was added because a real run showed miscategorized/fragmented data without it:

1. **`finalize_data.py`**: fills 2023's missing 과목3 by mapping `구분2` onto the 과목3
   vocabulary seen in 2024+ sheets (`category_map_2023_final.json`, built once via fuzzy
   matching + a few manual corrections — reuse this file, don't regenerate it from scratch each
   run unless new 2023-only categories appear).
2. **`canon_merge.py`**: even within 2024+ sheets, the *same* category gets entered with
   different spacing/punctuation across different months/years — e.g. `일반 소모품` vs
   `일반소모품`, `위생설비(화장실, 주방 수전 소모품)` vs 4 other spacing variants of the same
   phrase, `근무복/유니폼` vs `근무복(유니폼)`. This script strips whitespace/commas and
   normalizes `(`/`)` vs `/` as equivalent, groups matches, and picks the most frequent spelling
   as canonical. **Always run this on new data** — new spelling variants can appear in any new
   upload.
3. **`canon_merge.py` also applies a user-specified 과목2-level override**: rows where 과목2 is
   `락카 소모품` get rolled up to one category (`락카 소모품`) instead of staying split across
   their several 과목3 sub-values; same for 과목2 in `{시설, 시설 소모품, 시설물}` → `시설`. If
   the user asks to merge another 과목2 group the same way, add it to the `GROUP2_OVERRIDE` dict
   in `canon_merge.py` — don't hand-merge categories anywhere else in the pipeline.

Every category-grouping step downstream (overview charts, top-N selection, monthly breakdowns,
matrix, ABC analysis, detail slides, YoY trends) must group by the resulting `과목3_norm`
column — never the raw un-normalized 과목3.

## Pipeline gotcha: script run order

`export_json.py` and `export_yoy.py` both read-modify-write the **same** `report_data.json`.
`export_yoy.py` adds fields (`periods`, `cat_yoy`, `vend_yoy`) that `generate2.js` needs. If you
edit `export_json.py` and rerun it standalone, it **overwrites `report_data.json` from scratch**
and silently drops the fields `export_yoy.py` had added, and `node generate2.js` will crash with
`Cannot read properties of undefined (reading 'map')`. **Always use `run_all.sh`**, which runs
them in the correct order (`prep_data → finalize_data → canon_merge → export_json → export_yoy →
node generate2.js → validate.py`). If you must run scripts individually while debugging, always
finish with `python3 export_yoy.py` before running `generate2.js`.

## Report scope & defaults

- **No budget/plan (계획금액) data source** — never fabricate a plan-vs-actual comparison.
- **One 사업장 per deck** — filter to a single site, never merge sites.
- **Default period**: most recent year-sheet present (e.g. "2026 상반기"), unless the user names
  a different one.
- **Multi-year YoY** is used throughout (연도별 비교, 연도별 추이 in overview/detail slides) even
  though the main report period is a single (possibly partial) year — 2023–2025 are full-year
  totals, the latest sheet may be a half-year total. Always label partial years explicitly
  (e.g. "상반기(1~6월)") next to full-year figures; never prorate/annualize to make them look
  comparable — show the raw figures with the caveat stated.
- **Out-of-range order dates**: a handful of rows tagged with the current period have 발주일
  outside the period's month range (e.g. a few Sep/Oct/Dec 2025 orders inside a "2026 상반기"
  sheet — likely early/carryover procurement). Bucket these into an explicit **"기타"** column in
  every monthly breakdown table rather than silently excluding them — otherwise the monthly
  columns quietly sum to less than the true category/vendor/grand total, which is exactly the
  kind of discrepancy a numbers-focused reviewer will catch.
- **Top-N is a fixed count, not a % threshold**: top 4 품목구분 categories and top 5 업체 get
  individual detail slides; monthly breakdown tables use a wider top-15 to fill the page and
  minimize the "그 외" bucket (confirm counts with the user if they haven't been stated).
- **Minimize "그 외" everywhere it can reasonably be minimized**: item-level detail tables show
  up to 18 items per category / 20 per vendor before bucketing the remainder — size the table's
  row height dynamically (`rowH = min(default, availableHeight / rows.length)`, shrink font past
  ~15 rows) so it never overflows the slide.

## Slide structure (21 slides, current agreed version)

1. **표지** — 총 집행 금액only (no plan comparison), 품목/업체 분석 대상 개수.
2. **목차**
3. **연도별 비교** — column chart + table, 연간 vs 상반기 caveat footnote.
4. **주요 품목구분 연도별 총금액** — vertical **clustered column** chart, X=top4 categories,
   series=연도(4개 막대씩), side table with exact 원 단위 숫자, "그 외" NOT used here (this is a
   YoY-by-category view, not a same-period overview).
5. **주요 업체 연도별 총금액** — same, for top5 vendors.
   *(Slides 4–5 intentionally show YoY-by-item, not a single-period ranked bar — an earlier
   single-period horizontal-bar version was replaced per user feedback to fold the trend
   dimension in directly rather than have a separate redundant trend slide.)*
6. **구매전략 수립 예시 — 지출액 × 발주빈도** — 2×2 **card grid**, fixed position by letter:
   **A=top-left, B=top-right, C=bottom-left, D=bottom-right** (not tied to axis direction — this
   was deliberately decoupled from a scatter-plot metaphor after multiple overlap bugs; each
   card states its own 특징/전략 in text, so the axis legend is just informational, not
   positional). Each item line shows **both 금액 and 발주건수** (`eok(금액) · N건`).
   *(A previous version also had a Kraljic-matrix second slide (비용영향×공급리스크, using
   vendor-count-per-category as a supply-risk proxy) — the user asked to delete it. Keep the
   Kraljic computation in `export_json.py` (`matrix_kraljic`, harmless if unused) in case it's
   wanted again, but don't render it by default.)*
7. **ABC 분석 (파레토)** — 3 summary cards (A/B/C grade, cumulative-% thresholds 70/90) + three
   side-by-side tables: A grade (all items, small), B and C grade (top 5 each, since those lists
   are long) + one analysis card below.
8. **정기계약 전환 후보** — **업체 기준** (not 품목구분 — this was explicitly corrected by the
   user), vendors with ≥5 orders in-period, showing 주요 품목구분/건수/금액/연환산(추정).
9. **품목구분별 집행 금액 (월별 세부)** — wide top-15 + 그 외 + **기타(범위외)** column.
10–13. **품목구분별 상세** (top4, one slide each) — item table (up to 18 rows) + this category's
   own YoY column chart (top-right) + the top4-overview mini bar chart (bottom-right) with **the
   current slide's category highlighted in gold, others in light blue** — a per-bar
   `chartColors` array, not a single color.
14. **업체별 집행 금액 (월별 세부)** — same wide treatment as #9.
15–19. **업체별 상세** (top5) — same pattern as #10–13, with "주요 품목구분" noted under the title.
20–21. **추가 분석** — currently 월별 발주 패턴(계절성) + 연도별 신규·이탈 거래업체. This section
   has been fully swapped twice already at the user's request (previous versions: 단일공급처
   리스크+단가편차, then 리드타임+미지급현황) — **treat this section as the most likely to be
   replaced again**; ask what angle they want before assuming last time's choice still applies,
   and don't be surprised if they want a third swap. Good candidate analyses that haven't been
   used yet: 담당자별 처리 현황 (skip unless asked — it surfaces individual workload data about
   named staff, which reads oddly in a self-authored report), 발주-대금지급 리드타임 (as opposed
   to 발주-입고), 단가 이상치 탐지 on a broader item set, 예산 대비 실적 (needs a plan-data
   source this pipeline doesn't have).

Footer on every content slide reads "㈜동훈 그룹 기획감사팀" bottom-right (matches the user's
actual team — this was corrected from an earlier "전략구매팀" placeholder guess; don't revert).

## Design system

Navy/gold "Midnight Executive" palette, defined at the top of `generate2.js`:
`NAVY=1E2761, NAVY_D=141B47, ICE=CADCFC, ICE_L=EAF0FC, GRAY=6B7280, TXT=232735, GOLD=C9A24B`.
- Cover slide: navy background, two oversized soft-edged circles for depth, gold divider rule.
- Content slides: white background, `titleBlock()` helper (tag + bold title + thin ICE rule).
- "분석"/"전략" callouts use `analysisCard()`: a rounded rect with a thin gold left accent bar —
  never a flat colored rectangle (an earlier flat-box version read as visually cluttered).
- 2×2 strategy matrices use a **card grid**, not a scatter plot — see slide 6 above. This is a
  deliberate simplification after the scatter version had recurring dot/label overlap bugs that
  were hard to fully eliminate with absolute positioning; the card list has zero overlap by
  construction (`lineH = min(cap, availableHeight / itemCount)`).
- Overview mini-charts inside detail slides use per-bar highlight coloring (gold for "this
  slide's" item, ICE for the rest) rather than a uniform color — cheap and makes the detail
  slide's context immediately legible.

## Known pptxgenjs pitfalls hit during development

- **Chart data-label format codes**: complex Excel-style codes like `"#,##0,,.0\"억\""` (comma
  scaling trick) rendered as **blank labels** in LibreOffice with no error. Fix: pre-scale the
  values in JS (divide by 1e8, round) and use a plain format code like `"0.0"` or `'0.0"억"'`.
  Always set `dataLabelColor` explicitly too — the default can be invisible against a light
  chart background.
- **Table row overflow**: pptxgenjs doesn't auto-shrink rows to fit a bounding box. Compute
  `rowH = Math.min(defaultRowH, availableHeight / rows.length)` and drop font size a notch past
  ~15 rows, every time row count is data-dependent (item counts vary a lot by category/vendor).
- **JSON pipeline field loss**: see "Pipeline gotcha" above.

## Adapting to a different 사업장 (e.g. 창녕)

The current scripts are written with 포천 hardcoded in several places (`finalize_data.py`'s debug
prints, the `사업장=='포천'` filters in `export_json.py`/`export_yoy.py`, and slide title text
like "연도별 비교 (포천, 총 집행금액)" in `generate2.js`). This hasn't been generalized to a
`SITE` variable yet — when the user asks for another site, find-and-replace `포천` → the target
site across `export_json.py`, `export_yoy.py`, and the title strings in `generate2.js`, then
re-run `run_all.sh`. Worth parameterizing properly (e.g. a `SITE` env var read by all the Python
scripts) the next time this comes up, rather than repeating the find-replace by hand.

## Visual QA limitation

The `view` tool for inspecting rendered slide images has been unreliable in this environment
during development (calls succeed and produce non-trivial image files — confirmed via pixel
diversity checks — but no visual content came through for review). When this happens: validate
structurally instead — `validate.py` for file integrity, `markitdown` text dump grepped for
placeholder/error strings, and row-fit math worked out by hand (as documented in "Known pptxgenjs
pitfalls" above) — and tell the user plainly that visual re-confirmation wasn't possible so they
know to double-check layout-sensitive spots themselves (long vendor-name lists, matrix cards,
wide tables) rather than assuming it's been visually verified.
