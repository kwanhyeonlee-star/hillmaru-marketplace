---
name: hillmaru-pocheon-price-comparison
description: Build a 힐마루 포천 purchase price-comparison Excel report (단가비교조사 / 구매품목 가격비교) from item info the user provides (specs, purchase-request captures, PDFs, links). Use whenever the user uploads or describes item(s) to buy for 힐마루 포천 and asks for a 단가비교, 가격비교, or 견적비교 spreadsheet — even without saying "skill." One item → single-item format (assets/single_item_template.xlsx). Two or more items → multi-item format (assets/multi_item_template.xlsx). Always web-search current prices/vendors for each item before filling the sheet — this is a research task, not just formatting.
---

# 힐마루 포천 구매품목 단가비교 보고서

Two output formats depending on item count. **Count the items in what the
user gave you first** — that decision picks the template.

| Item count | Template | Structure |
|---|---|---|
| 1 item | `assets/single_item_template.xlsx` | One sheet: spec-by-spec comparison across several candidate products, tailored spec columns per item type |
| 2+ items | `assets/multi_item_template.xlsx` | `01_최종추천` summary sheet (one row per item) + one detail sheet per item (`02_품목명`, `03_품목명`, ...) + closing `NN_조사기준_주의사항` sheet |

Both templates are real, fully-styled example workbooks (colors, merges,
column widths, formulas already correct) — **load the matching template with
openpyxl and build the new file by populating/cloning its rows and sheets**,
don't build formatting from scratch. `data_only=False` when loading so you
keep the existing formulas.

## Workflow

1. **Read what the user gave you** — spec sheet, purchase-request photos/PDF,
   existing model to replace, links they already have. Extract: item
   name(s), any existing/reference model, required quantity, key specs that
   matter for compatibility (e.g. connector types, size, material grade —
   varies completely by item category, there's no fixed list).
2. **Web-search current prices** for each item across multiple vendors —
   this is the actual value of the report, not a formality. For each
   candidate/vendor capture: 판매가, 배송비, 판매처, URL, and a 확인 상태 tag
   (see vocabulary below). Do enough searches to get at least 2-3 real
   options per item; more for the top candidate.
3. **Pick the template** by item count and build the workbook (see the two
   modes below).
4. **Recalculate formulas** — `python /mnt/skills/public/xlsx/scripts/recalc.py <file>.xlsx`
   — mandatory, both templates use formulas (`=O5+P5` style totals,
   `=G5*F5`, `=SUM(...)`), never hardcode a computed cell.

## 확인 상태 vocabulary (use these exact labels, don't invent new ones)

- `요청서 기준` — price came from a purchase-request capture the user gave you
- `웹 확인` — you found and verified this price/listing yourself just now
- `검색 후보` — found in search but price/spec unconfirmed; **excluded from
  final recommendation**, listed only as a lead
- `가격 확인 필요` — page exists but price wasn't retrievable

## Mode A — Single item (`single_item_template.xlsx`)

Sheet `단가비교`:
- Row 1 title: `{배송지/현장명} {품목명} 단가 비교 조사`
- Row 2: 조사기준일 (today) · 기존모델 (if replacing something) · 구매목적
- Row 4 header + data rows: **spec columns are item-specific** — the
  template's example (화면크기/해상도/패널/HDMI/DVI/VGA/오디오/VESA/밝기/응답속도)
  is for a monitor. For a different item, replace those middle columns with
  whatever specs actually differentiate candidates for *that* item (e.g. a
  hose: 규격/재질/길이/내압; a battery: 전압/용량/단자타입). Keep 순위, 구분,
  제조사, 모델명 on the left and 판매가/배송비/총비용/판매처/구매상태/호환성
  평가/출처 URL on the right — those are constant across item types.
  총비용 stays a formula: `=IF(O5="","",O5+P5)` (adjust column letters to
  your layout).
- `구매 검토 의견` block below the table: 1순위/2순위/3순위 rows (pick and
  justify — price alone isn't the criterion, note compatibility/risk same as
  the example) + 주의사항 row (what to verify before ordering) + a closing
  disclaimer line about prices being subject to change.
- Second sheet `출처및기준`: 구분/내용/판단기준/비고 table explaining what
  "기존제품", "필수사양", the star-rating tiers, etc. mean for this
  particular comparison — write these fresh for the item at hand, the
  template's rows are just the CCTV-monitor example.

## Mode B — Multiple items (`multi_item_template.xlsx`)

- `01_최종추천`: one row per item — No./품목/선정 업체/단가/배송비/예상 합계
  (`=단가+배송비`)/수량/총금액 (`=수량*예상합계`)/구매·확인 경로/선정 사유/확인
  상태. Closing row `합계(확정 금액만)` sums only rows with confirmed
  pricing (`=SUM(...)`) — **exclude `검색 후보` rows from this sum**, same as
  the example (it only totals confirmed 단가/배송비/합계/총금액).
- One detail sheet per item, named `NN_품목명` (zero-padded two-digit
  prefix, sequential from 02). Columns: 순위/업체·경로/단가/배송비/합계
  (formula)/확인 상태/비고/URL·출처. **Highlight the selected (rank-1) row**
  with the light-green fill used in the example (`FFE2F0D9`) and bold text —
  that's what visually marks the pick. Below the table: `Unit장 최종 의견`
  header row + a merged cell with the reasoning, ending with the standard
  disclaimer line (see template row for exact wording, adjust the date).
- To generate N detail sheets from the template (which ships with 17 as
  example content): use `wb.copy_worksheet(wb["02_..."])` for each item,
  then rename and overwrite cell values — don't hand-build the styling.
- Closing sheet `{NN+1}_조사기준_주의사항`: 구분/내용 rows — 자료 기준,
  배송지, 정품/호환품 (if relevant), 구성 차이 (if variants exist),
  미확인 항목, 발주 직전 체크리스트. Write these for the actual items, the
  template's rows are the EB6200-parts example.

## Formatting reference (both templates)

- Title bar: navy `FF1F4E78` fill, white bold text, size 16 (sheet title) /
  13 (section header like `구매 검토 의견`)
- Column header row: blue `FF5B9BD5` fill, white bold text, centered
- Info/label cells (조사기준일 등, 순위 label cells): light blue `FFD9EAF7`
  fill, bold
- Selected/rank-1 row highlight (multi-item detail sheets only): light
  green `FFE2F0D9`, bold
- Footnote/disclaimer line: mustard text `FF7F6000` on pale yellow
  `FFFFF2CC` fill, merged across the table width
- Font: default (Calibri-equivalent), size 11 body / 16 title — match
  whatever the template already has rather than picking a new font

## Gotchas learned from real runs (read before editing template rows)

- **`ws.cell(row, col, value=None)` does NOT clear an existing cell** — openpyxl
  treats `value=None` as "don't touch this cell," so a cell that already had
  data from the template keeps it. To blank a cell, assign the attribute
  directly: `ws['O8'].value = None` (or `= ''`). Hit this exact bug when
  building a row with fewer filled columns than the template's example row.
- **`ws.delete_rows(n, count)` does NOT shift merged cell ranges.** The
  template has merges below the data table (`구매 검토 의견` title row,
  disclaimer row). If you delete rows above them to match your candidate
  count, the merge *ranges* stay pinned to their original row numbers while
  the *content* shifts — so a merge lands on top of your data rows and
  corrupts them (`MergedCell value is read-only` error on write). Fix: after
  `delete_rows`, explicitly `unmerge_cells` the old ranges and `merge_cells`
  new ones at the shifted row numbers. Always print
  `ws.merged_cells.ranges` after a `delete_rows` call and sanity-check it
  before writing more cells.
- **Don't delete rows to match candidate count if you can avoid it** —
  simpler and safer to leave extra template rows blank (just don't write
  data into them) than to delete rows and fight merge-range drift. Only
  delete rows when leaving them blank would look wrong (e.g. in the middle
  of a table with borders).
- **A link the user gives you may no longer point to the product they mean.**
  A previous run's "구매 링크.txt" pointed at a COMMAX product page that had
  been reassigned to a completely different item (LG monitor) by the time it
  was fetched. Always `web_fetch` the given link and check the actual title/
  price against what the user described — don't assume the link is still
  valid, and flag the mismatch in 비고 rather than silently substituting.
- **Domain fact worth remembering for monitor purchases specifically:** 22"
  CCTV/PC monitors with HDMI+DVI+VGA all three are effectively discontinued
  in the current Korean market — DVI has been phased out. If the existing
  unit has DVI, expect no true drop-in replacement; say so explicitly in
  주의사항 rather than forcing a candidate into a 5-star compatibility
  rating it doesn't deserve.
- **After any row insertion/deletion**, re-run `recalc.py` and reprint the
  sheet with `markitdown` before considering the file done — a merge/shift
  bug silently produces a file that opens fine but has scrambled cells.

## After building

- `recalc.py` (see Workflow step 4) — fix anything it flags before delivering.
- Open the file (`markitdown` or convert to images via the xlsx skill) and
  sanity-check: every 총비용/합계/총금액 cell shows a real number, not blank
  or an error; the rank-1 row highlight landed on the row you actually
  recommend; `검색 후보` rows aren't counted in any total.
