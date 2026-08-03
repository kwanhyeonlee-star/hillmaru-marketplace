---
name: hillmaru-changnyeong-course-report
description: Generate the monthly "힐마루 창녕 코스 컨디션 점검" (course condition inspection) PowerPoint report from a course-photo zip and a Tee/F.W./Green evaluation Excel file. Use this whenever the user uploads course photos + an evaluation spreadsheet for 힐마루 창녕 and asks for the monthly course condition report, or mentions "코스 컨디션 점검", "코스 컨디션 확인", or this report by name — even if they don't spell out the steps, since this skill already knows the exact format.
---

# 힐마루 창녕 코스 컨디션 점검 보고서 생성

Builds the recurring monthly report from two inputs the user provides each month:

1. **사진 압축파일 (zip)** — course condition photos, filenames like
   `동코스 1번홀 그린.jpg` or `동코스 5번홀 페어웨이 보식잔디 탐.jpg`
   (`{코스}코스 {N}번홀 {그린 | 특이사항 설명}.jpg`). Folder structure inside
   the zip doesn't matter — only the filename is parsed.
2. **평가표 (xlsx)** — Tee/F.W./Green condition scores. One sheet per visit,
   sheet name `YY.MM.DD`. Each sheet has one or two stacked tables (titled
   `■ ... 동서 코스 컨디션 확인` / `■ ... 남북 코스 컨디션 확인`); a given
   visit sometimes only fills in two of the four courses.

Output: a `.pptx` with a title slide, one evaluation-table slide per course
pair that has data (동서 / 남북), and one slide per hole (36 total across
동/서/남/북 × 9 holes) showing the green photo + labeled 특이사항 photos.

## Steps

Run from a scratch work directory (e.g. `/home/claude/report_build/`):

```bash
python3 scripts/extract_photos.py <사진_압축파일.zip> .
python3 scripts/extract_eval.py <평가표.xlsx> eval_data.json
node scripts/generate.js eval_data.json photo_map.json <출력파일명>.pptx
```

- `extract_photos.py` unzips, parses course/hole/label from each filename,
  fixes EXIF rotation, and downsizes+recompresses each photo (long edge
  1600px, quality 78) — this keeps the final deck to tens of MB instead of
  hundreds. Prints a warning listing any filename that didn't match the
  naming pattern — check those manually, they're skipped.
- `extract_eval.py` scans the most recent sheet (by `YY.MM.DD` name) for
  course blocks. If a course is missing from that sheet (e.g. only 동서 was
  visited that month), it falls back to the most recent older sheet that has
  that course, so the report always covers all four courses. Prints which
  courses (if any) had to fall back to an older sheet — mention this to the
  user if it happens, since they may want the section labeled accordingly.
- `generate.js` builds the actual deck. `pptxgenjs` must be available
  (preinstalled in this environment — do not `npm install` first).

After generating, **always** run:
```bash
python /mnt/skills/public/pptx/scripts/office/validate.py <출력파일명>.pptx
```
and spot-check a few slides by converting to images (see the `pptx` skill's
"Converting to Images" section) — especially any hole with 4+ photos, since
that's the layout most likely to overflow if the grid math ever needs
adjusting.

## Design notes (read before modifying `generate.js`)

- **Photo grid per hole** is dynamic: `cols = min(4, photo_count)`,
  `rows = ceil(count/cols)`, and image height is computed from
  `(available_height / rows)` — NOT a fixed height. This was a real bug
  during development: a fixed image height overflowed the slide for any
  hole with more than 3 photos. If you change the layout, keep it dynamic.
- **초록/그린 사진이 항상 먼저** — `is_green` photos are sorted to the front
  of each hole's grid.
- **평가표 표 (overview slide)**: zebra-striped rows, F/W and Green scores
  ≤7 highlighted yellow, remark columns get the most column width since
  they hold free-text (widen those first if text still wraps awkwardly).
- **File size**: photos are the entire size driver (raw phone photos run
  4-5MB each × ~70 photos = 300MB+ decks). Always compress in
  `extract_photos.py`; don't insert originals.
- Company footer and title text are constants at the top of `generate.js`
  (`REPORT_TITLE`, `FOOTER_TEXT`) — only touch these if the client/branding
  changes, not per-report.
- Course order is fixed: 동 → 서 → 남 → 북, 9 holes each. Overview slides
  pair 동서 and 남북 (matching the source spreadsheet's own grouping).

## If the user reports a problem next time

- **"사진이 이상한 홀에 들어갔어" / photo matched to wrong hole**: check the
  filename against `NAME_RE` in `extract_photos.py` — a typo in the course
  prefix or "번홀" spacing will silently misparse or land in `unmatched`.
- **"용량이 커"**: lower `MAX_DIM`/`QUALITY` in `extract_photos.py` (currently
  1600px / 78).
- **New course or hole count** (e.g. a 5th course, or 18 holes instead of 9):
  update `courseOrder` and the `hole <= 9` loop bound in `generate.js`, and
  the `overviewPairs` grouping.
