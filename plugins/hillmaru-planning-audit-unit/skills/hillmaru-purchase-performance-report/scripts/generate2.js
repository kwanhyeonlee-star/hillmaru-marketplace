const pptxgen = require("pptxgenjs");
const fs = require("fs");

const D = JSON.parse(fs.readFileSync("./report_data.json", "utf-8"));

const NAVY = "1E2761";
const NAVY_D = "141B47";
const ICE = "CADCFC";
const ICE_L = "EAF0FC";
const WHITE = "FFFFFF";
const GRAY = "6B7280";
const TXT = "232735";
const GOLD = "C9A24B";

function fmt(n) {
  if (n === null || n === undefined) return "";
  return Math.round(n).toLocaleString("en-US");
}
function eok(n) {
  return (n / 100000000).toFixed(1) + "억";
}

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE";
const PW = 13.33,
  PH = 7.5;

let PAGE = 0;

function footer(slide, pageNum) {
  slide.addText("㈜동훈 그룹 기획감사팀", {
    x: PW - 3.5, y: PH - 0.42, w: 3.3, h: 0.3,
    fontFace: "Arial", fontSize: 9, color: GRAY, align: "right",
  });
  slide.addText(String(pageNum), {
    x: 0.4, y: PH - 0.42, w: 0.6, h: 0.3,
    fontFace: "Arial", fontSize: 9, color: GRAY, align: "left",
  });
}

function contentSlide() {
  PAGE++;
  const slide = pres.addSlide();
  slide.background = { color: WHITE };
  footer(slide, PAGE);
  return slide;
}

function titleBlock(slide, tag, title) {
  slide.addText(
    [
      { text: tag + "  ", options: { color: NAVY, bold: true } },
      { text: title, options: { color: TXT, bold: true } },
    ],
    { x: 0.5, y: 0.28, w: 11.5, h: 0.55, fontFace: "Cambria", fontSize: 22 }
  );
  slide.addShape(pres.ShapeType.line, {
    x: 0.5, y: 0.92, w: 12.33, h: 0, line: { color: ICE, width: 1.5 },
  });
}

// ================= Slide 1: 표지 =================
{
  PAGE++;
  const slide = pres.addSlide();
  slide.background = { color: NAVY };
  slide.addShape(pres.ShapeType.ellipse, { x: 10.6, y: -1.6, w: 4.6, h: 4.6, fill: { color: NAVY_D }, line: { type: "none" } });
  slide.addShape(pres.ShapeType.ellipse, { x: -1.4, y: 5.2, w: 3.6, h: 3.6, fill: { color: NAVY_D }, line: { type: "none" } });
  slide.addText("포천 힐마루 – 구매 실적 보고", { x: 0.9, y: 2.55, w: 11.5, h: 0.9, fontFace: "Cambria", fontSize: 36, bold: true, color: WHITE });
  slide.addText("2026년 상반기 (2023~2026년 연도별 추이 포함)", { x: 0.9, y: 3.35, w: 11.5, h: 0.5, fontFace: "Calibri", fontSize: 18, color: ICE });
  slide.addShape(pres.ShapeType.line, { x: 0.95, y: 4.05, w: 3.2, h: 0, line: { color: GOLD, width: 2 } });
  slide.addText(
    [
      { text: `총 집행 금액 : ₩ ${fmt(D.total_amount)}`, options: { bold: true, breakLine: true } },
      { text: `품목 구분별 비용 분석 (총 ${D.total_cat_count}개 품목구분 / 상위 ${D.cat_top_names.length}개 분석)`, options: { breakLine: true } },
      { text: `업체별 비용 분석 (총 ${D.total_vend_count}개 업체 / 상위 ${D.vend_top_names.length}개 업체 분석)` },
    ],
    { x: 0.95, y: 4.35, w: 10.5, h: 1.6, fontFace: "Calibri", fontSize: 15, color: WHITE, lineSpacingMultiple: 1.35 }
  );
  slide.addText("2026. 07. 28  보고", { x: 0.95, y: 6.55, w: 6, h: 0.4, fontFace: "Calibri", fontSize: 12, color: ICE });
  slide.addText("㈜동훈 그룹 기획감사팀", { x: PW - 4.3, y: 6.9, w: 4, h: 0.35, fontFace: "Arial", fontSize: 10, color: ICE, align: "right" });
}

// ================= Slide 2: 목차 =================
{
  const slide = contentSlide();
  slide.addText("목차", { x: 0.5, y: 0.5, w: 6, h: 0.7, fontFace: "Cambria", fontSize: 30, bold: true, color: NAVY });
  const toc = [
    ["1", "연도별 비교", "3"],
    ["2", "상반기 구매내역 (품목구분별 · 업체별, 연도별 총금액)", "4"],
    ["3", "구매전략 수립 예시", "6"],
    ["4", "품목구분별 집행 금액", "9"],
    ["5", "업체별 집행 금액", "14"],
    ["6", "추가 분석 (월별 계절성 · 신규·이탈 거래업체)", "20"],
  ];
  let y = 1.75;
  toc.forEach((row) => {
    slide.addText(row[0], { x: 0.9, y, w: 0.5, h: 0.5, fontFace: "Cambria", fontSize: 19, bold: true, color: GOLD });
    slide.addText(row[1], { x: 1.5, y, w: 9, h: 0.5, fontFace: "Calibri", fontSize: 16, color: TXT });
    slide.addText(row[2], { x: 11.3, y, w: 1.2, h: 0.5, fontFace: "Calibri", fontSize: 13, color: GRAY, align: "right" });
    slide.addShape(pres.ShapeType.line, { x: 0.9, y: y + 0.52, w: 11.6, h: 0, line: { color: ICE_L, width: 1 } });
    y += 0.78;
  });
}

// ================= Slide 3: 연도별 비교 =================
{
  const slide = contentSlide();
  titleBlock(slide, "1)", "연도별 비교 (포천, 총 집행금액)");
  const years = ["2023", "2024", "2025", "2026 상반기"];
  const vals = years.map((y) => Math.round((D.yoy[y] / 1e8) * 10) / 10);
  slide.addChart(pres.ChartType.bar, [{ name: "총 집행금액", labels: years, values: vals }], {
    x: 0.6, y: 1.2, w: 7.6, h: 4.6, barDir: "col",
    chartColors: [NAVY, NAVY, NAVY, GOLD],
    valAxisLabelFormatCode: "0.0",
    showTitle: true, title: "연도별 총 집행금액 (포천, 단위: 억원)", titleFontFace: "Calibri", titleFontSize: 13,
    showValue: true, dataLabelFormatCode: "0.0", dataLabelPosition: "outEnd", dataLabelFontSize: 11,
    dataLabelColor: NAVY, dataLabelBold: true,
    catAxisLabelFontSize: 11, valAxisLabelFontSize: 9,
    valGridLine: { color: ICE_L, size: 1 }, catGridLine: { style: "none" }, showLegend: false,
  });
  slide.addTable(
    [
      [
        { text: "연도", options: { bold: true, fill: { color: NAVY }, color: WHITE } },
        { text: "2023", options: { bold: true, fill: { color: NAVY }, color: WHITE, align: "right" } },
        { text: "2024", options: { bold: true, fill: { color: NAVY }, color: WHITE, align: "right" } },
        { text: "2025", options: { bold: true, fill: { color: NAVY }, color: WHITE, align: "right" } },
        { text: "2026 상반기", options: { bold: true, fill: { color: NAVY }, color: WHITE, align: "right" } },
      ],
      ["총 공급가", { text: fmt(D.yoy["2023"]), options: { align: "right" } }, { text: fmt(D.yoy["2024"]), options: { align: "right" } }, { text: fmt(D.yoy["2025"]), options: { align: "right" } }, { text: fmt(D.yoy["2026 상반기"]), options: { align: "right" } }],
      ["기준 기간", { text: "연간", options: { align: "right", color: GRAY } }, { text: "연간", options: { align: "right", color: GRAY } }, { text: "연간", options: { align: "right", color: GRAY } }, { text: "상반기(1~6월)", options: { align: "right", color: GOLD, bold: true } }],
    ],
    { x: 8.5, y: 1.3, w: 4.35, colW: [0.85, 0.875, 0.875, 0.875, 0.875], fontSize: 8, fontFace: "Calibri", border: { type: "solid", color: ICE_L, pt: 0.75 }, autoPage: false, margin: [2, 3, 2, 3] }
  );
  slide.addText(
    "※ 2023~2025는 연간 총 집행금액, 2026은 상반기(1~6월)만 집계된 금액입니다. 기간이 달라 직접적인 증감률 비교보다는 추세 참고용으로 확인해 주세요.",
    { x: 8.5, y: 2.75, w: 4.35, h: 1.2, fontFace: "Calibri", fontSize: 9.5, italic: true, color: GRAY }
  );
  analysisCard(slide, 8.5, 4.3, 4.35,
    "분석: 2024년 이후 총액이 감소 추세이며, 2026 상반기(6.3억)는 2025년 상반기 수준(추정)과 유사한 흐름으로 보입니다. 하반기 반영 시 연간 추세 재확인 필요."
  );
}

// ================= overviewSlide helper (slides 4,5) — 연도별 그룹 세로 막대 =================
function overviewSlide(tag, title, names, yoyMap, isVendor) {
  const slide = contentSlide();
  titleBlock(slide, tag, title);
  const periods = D.periods;
  const palette = [NAVY, "3E5C9A", "7C93C7", GOLD];
  const chartSeries = periods.map((p, i) => ({
    name: p,
    labels: names,
    values: names.map((n) => yoyMap[n][i]),
  }));
  slide.addChart(pres.ChartType.bar, chartSeries, {
    x: 0.5, y: 1.15, w: 7.6, h: 5.15, barDir: "col", barGrouping: "clustered",
    chartColors: palette,
    showTitle: false, showValue: true,
    dataLabelFormatCode: "#,##0,,\"억\"",
    dataLabelPosition: "outEnd", dataLabelFontSize: 7.5, dataLabelColor: TXT,
    catAxisLabelFontSize: 9.5, valAxisHidden: true,
    valGridLine: { style: "none" }, catGridLine: { style: "none" },
    showLegend: true, legendPos: "b", legendFontSize: 9,
  });
  const header = ["구분", ...periods].map((h, i) => ({ text: h, options: { bold: true, fill: { color: NAVY }, color: WHITE, align: i === 0 ? "left" : "right", fontSize: 8 } }));
  const rows = [header];
  names.forEach((n) => {
    rows.push([{ text: n, options: { align: "left", fontSize: 8 } }, ...yoyMap[n].map((v) => ({ text: fmt(v), options: { align: "right", fontSize: 8 } }))]);
  });
  slide.addTable(rows, {
    x: 8.3, y: 1.15, w: 4.5, colW: [1.3, 0.8, 0.8, 0.8, 0.8],
    fontSize: 8, fontFace: "Calibri", border: { type: "solid", color: ICE_L, pt: 0.75 }, autoPage: false, rowH: 0.34, margin: [2, 3, 2, 3],
  });
  const footnoteY = 1.15 + rows.length * 0.34 + 0.15;
  slide.addText(
    "※ 2023~2025는 연간, 2026은 상반기(1~6월) 금액입니다. 기간이 달라 직접 비교보다는 추세 참고용으로 봐주세요. 0으로 표시된 구간은 해당 기간 신규 발주 기록이 없었던 경우입니다.",
    { x: 8.3, y: footnoteY, w: 4.5, h: 1.0, fontFace: "Calibri", fontSize: 8.5, italic: true, color: GRAY }
  );
  slide.analysisY = footnoteY + 1.05;
  return slide;
}

function analysisCard(slide, x, y, w, text) {
  const maxBottom = 6.85;
  const h = Math.max(0.9, Math.min(1.5, maxBottom - y));
  slide.addShape(pres.ShapeType.roundRect, { x, y, w, h, rectRadius: 0.05, fill: { color: ICE_L }, line: { type: "none" } });
  slide.addShape(pres.ShapeType.rect, { x, y, w: 0.06, h, fill: { color: GOLD }, line: { type: "none" } });
  slide.addText(text, { x: x + 0.2, y: y + 0.12, w: w - 0.35, h: h - 0.24, fontFace: "Calibri", fontSize: 8.5, color: TXT, valign: "middle", lineSpacingMultiple: 1.15 });
}

// ---- Slide 4: 구매내역 (품목구분별, 연도별) ----
{
  const slide = overviewSlide("2-1)", "주요 품목구분 연도별 총금액 (포천)", D.cat_top_names, D.cat_yoy, false);
  const top4pct = Math.round((D.cat_chart.slice(0, 4).reduce((s, d) => s + d[1], 0) / D.total_amount) * 100);
  analysisCard(
    slide, 8.3, slide.analysisY, 4.5,
    `분석: 상위 4개 품목구분(비료·장비 소모품비·농약·골재)이 2026년 상반기 전체의 약 ${top4pct}%를 차지. 연도별로도 꾸준히 지출 상위권을 유지하고 있어 연간 계약/단가표 도입 검토 필요 (초안 — 담당자 확인 요망).`
  );
}

// ---- Slide 5: 구매내역 (업체별, 연도별) ----
{
  const slide = overviewSlide("2-2)", "주요 업체 연도별 총금액 (포천)", D.vend_top_names, D.vend_yoy, true);
  const top5pct = Math.round((D.vend_chart.slice(0, 5).reduce((s, d) => s + d[1], 0) / D.total_amount) * 100);
  analysisCard(
    slide, 8.3, slide.analysisY, 4.5,
    `분석: 총 ${D.total_vend_count}개 업체 중 상위 5개사가 2026년 상반기 전체의 약 ${top5pct}%. 업체별로 연도에 따라 거래 규모 변동이 있어 상위 업체 중심 연간 단가/납기 계약 체결 여지 검토 필요 (초안 — 담당자 확인 요망).`
  );
}


// ================= Slide 8 & 9: 매트릭스 =================
function quadPos(quad) {
  const base = { A: { x: 0.62, y: 0.25 }, B: { x: 0.62, y: 0.72 }, C: { x: 0.18, y: 0.25 }, D: { x: 0.18, y: 0.72 } };
  return base[quad];
}

function matrixSlide(tag, title, axisXLabel, axisYLabel, axisXHint, axisYHint, data, quadMeta, fmtFn, subFn) {
  const slide = contentSlide();
  titleBlock(slide, tag, title);
  slide.addText(
    "→ 데이터 기반 자동 배치(초안): X축은 실제 지출/단가 데이터, Y축은 " + axisYLabel + " 데이터를 대리 지표로 사용한 결과입니다. 실제 긴급성·관리우선순위 판단은 담당자 검토가 필요합니다.",
    { x: 0.5, y: 1.0, w: 12.3, h: 0.38, fontFace: "Calibri", fontSize: 10, italic: true, color: GRAY }
  );

  const gridX = 0.5, gridY = 1.55, gridW = 12.3, gridH = 5.55;
  const gap = 0.22;
  const cardW = (gridW - gap) / 2;
  const cardH = (gridH - gap) / 2;
  const quads = [
    { k: "A", x: gridX, y: gridY },
    { k: "B", x: gridX + cardW + gap, y: gridY },
    { k: "C", x: gridX, y: gridY + cardH + gap },
    { k: "D", x: gridX + cardW + gap, y: gridY + cardH + gap },
  ];

  quads.forEach((q) => {
    const meta = quadMeta[q.k];
    const items = data.filter((d) => d.quad === q.k);
    // card background
    slide.addShape(pres.ShapeType.roundRect, {
      x: q.x, y: q.y, w: cardW, h: cardH, rectRadius: 0.06,
      fill: { color: ICE_L }, line: { color: ICE, width: 1 },
    });
    // left accent bar
    slide.addShape(pres.ShapeType.rect, { x: q.x, y: q.y, w: 0.08, h: cardH, fill: { color: NAVY }, line: { type: "none" } });
    // header: quadrant letter badge + short label
    slide.addShape(pres.ShapeType.ellipse, { x: q.x + 0.22, y: q.y + 0.16, w: 0.36, h: 0.36, fill: { color: NAVY }, line: { type: "none" } });
    slide.addText(q.k, { x: q.x + 0.22, y: q.y + 0.16, w: 0.36, h: 0.36, fontFace: "Cambria", fontSize: 13, bold: true, color: WHITE, align: "center", valign: "middle" });
    slide.addText(meta.label, { x: q.x + 0.7, y: q.y + 0.16, w: cardW - 0.94, h: 0.36, fontFace: "Calibri", fontSize: 11, bold: true, color: NAVY, valign: "middle" });
    // strategy line
    const stratH = subFn ? 0.5 : 0.72;
    slide.addText(meta.strategy, {
      x: q.x + 0.22, y: q.y + 0.58, w: cardW - 0.44, h: stratH,
      fontFace: "Calibri", fontSize: 8.5, color: TXT, lineSpacingMultiple: 1.12,
    });
    // divider
    const dividerY = q.y + 0.58 + stratH + 0.06;
    slide.addShape(pres.ShapeType.line, { x: q.x + 0.22, y: dividerY, w: cardW - 0.44, h: 0, line: { color: ICE, width: 0.75 } });
    // item list (clean vertical stack — no overlap by construction)
    const listY = dividerY + 0.1;
    const listH = q.y + cardH - 0.1 - listY;
    const lineH = Math.min(subFn ? 0.46 : 0.32, listH / Math.max(items.length, 1));
    items.forEach((d, i) => {
      const iy = listY + i * lineH;
      slide.addShape(pres.ShapeType.ellipse, { x: q.x + 0.24, y: iy + (subFn ? 0.1 : lineH / 2 - 0.035), w: 0.07, h: 0.07, fill: { color: GOLD }, line: { type: "none" } });
      if (subFn) {
        slide.addText(
          [
            { text: d.name, options: { bold: true, color: NAVY } },
            { text: `   ${fmtFn(d)}`, options: { color: GRAY } },
          ],
          { x: q.x + 0.4, y: iy, w: cardW - 0.6, h: lineH * 0.55, fontFace: "Calibri", fontSize: 9, valign: "top" }
        );
        slide.addText(subFn(d), {
          x: q.x + 0.4, y: iy + lineH * 0.52, w: cardW - 0.6, h: lineH * 0.48,
          fontFace: "Calibri", fontSize: 7, color: GRAY, italic: true, valign: "top",
        });
      } else {
        slide.addText(
          [
            { text: d.name, options: { bold: true, color: NAVY } },
            { text: `   ${fmtFn(d)}`, options: { color: GRAY } },
          ],
          { x: q.x + 0.4, y: iy, w: cardW - 0.6, h: lineH, fontFace: "Calibri", fontSize: 9, valign: "middle" }
        );
      }
    });
    if (items.length === 0) {
      slide.addText("해당 없음", { x: q.x + 0.4, y: listY, w: cardW - 0.6, h: 0.3, fontFace: "Calibri", fontSize: 9, color: GRAY, italic: true });
    }
  });

  // axis legend — quadrant position is now fixed A/B/C/D (not tied to axis direction); each card states its own 특징 explicitly
  slide.addText(
    `X축 지표: ${axisXLabel}${axisXHint ? " (" + axisXHint + ")" : ""}`,
    { x: gridX, y: gridY + gridH + 0.12, w: gridW, h: 0.32, fontFace: "Calibri", fontSize: 11.5, align: "center", color: NAVY, bold: true }
  );
  slide.addText(`Y축 지표: ${axisYLabel}${axisYHint ? " (" + axisYHint + ")" : ""}`, {
    x: gridX, y: 1.18, w: gridW, h: 0.3, fontFace: "Calibri", fontSize: 10, color: NAVY, bold: true, align: "right",
  });
}

const quadMeta1 = {
  A: { label: "지출액 ↑ · 발주빈도 ↑", strategy: "전략: 연간 계약·단가표 작성으로 구매 프로세스 간소화, 계획구매 강화(재고관리 → 사용계획 → 발주횟수/수량/단가 개선)" },
  B: { label: "지출액 ↑ · 발주빈도 ↓", strategy: "전략: 가격 적절성 검토 강화 — 스펙/대체품 검토 및 업체 경쟁 유도" },
  C: { label: "지출액 ↓ · 발주빈도 ↑", strategy: "전략: 사용계획 및 재고관리 강화 → 발주횟수 감소, 발주당 수량 증대" },
  D: { label: "지출액 ↓ · 발주빈도 ↓", strategy: "전략: 업무 효율 증가 방안 검토 (발주 횟수·관리 방식 등)" },
};
matrixSlide(
  "3-1)", "구매전략 수립 예시 — 지출액 × 발주빈도",
  "총 지출액", "발주 빈도(건수)", "상반기 공급가 합계", "상반기 발주 건수",
  D.matrix1, quadMeta1, (d) => `${eok(d.금액)} · ${d.건수}건`
);

// ================= Slide 3-2: ABC 분석 (파레토) =================
{
  const slide = contentSlide();
  titleBlock(slide, "3-2)", "구매전략 수립 예시 ② — ABC 분석 (파레토)");
  slide.addText(
    "→ 품목구분을 금액 누적 비중 기준으로 A(상위 70%) · B(70~90%) · C(90~100%) 등급으로 분류했습니다. 등급별로 관리 강도를 다르게 가져가는 것이 효율적입니다.",
    { x: 0.5, y: 1.0, w: 12.3, h: 0.4, fontFace: "Calibri", fontSize: 10, italic: true, color: GRAY }
  );
  const gradeMeta = {
    A: { color: NAVY, desc: "핵심 관리 대상 — 개별 협상, 연간 계약, 정기 시장가 모니터링" },
    B: { color: "3E5C9A", desc: "표준 프로세스 — 분기 단위 가격 점검, 복수 견적 유지" },
    C: { color: ICE, desc: "간소화 대상 — 자동발주/카드결제 등 관리 비용 최소화" },
  };
  let cardX = 0.5;
  const cardW3 = 3.95, cardGap = 0.22;
  ["A", "B", "C"].forEach((g) => {
    const s = D.abc_summary[g];
    slide.addShape(pres.ShapeType.roundRect, { x: cardX, y: 1.55, w: cardW3, h: 1.5, rectRadius: 0.06, fill: { color: ICE_L }, line: { color: ICE, width: 1 } });
    slide.addShape(pres.ShapeType.rect, { x: cardX, y: 1.55, w: 0.08, h: 1.5, fill: { color: gradeMeta[g].color === ICE ? GOLD : gradeMeta[g].color }, line: { type: "none" } });
    slide.addText(`${g} 등급`, { x: cardX + 0.22, y: 1.65, w: cardW3 - 0.4, h: 0.35, fontFace: "Cambria", fontSize: 15, bold: true, color: NAVY });
    slide.addText(`${s.count}개 품목구분 · ${s.pct_of_all}%`, { x: cardX + 0.22, y: 2.0, w: cardW3 - 0.4, h: 0.3, fontFace: "Calibri", fontSize: 11, bold: true, color: GRAY });
    slide.addText(`${fmt(s.total)}원`, { x: cardX + 0.22, y: 2.28, w: cardW3 - 0.4, h: 0.3, fontFace: "Calibri", fontSize: 11, color: TXT });
    slide.addText(gradeMeta[g].desc, { x: cardX + 0.22, y: 2.58, w: cardW3 - 0.4, h: 0.45, fontFace: "Calibri", fontSize: 8, color: GRAY, lineSpacingMultiple: 1.1 });
    cardX += cardW3 + cardGap;
  });
  // grade item lists — A (all), B/C (top 5) — three tables side by side
  const gradeCols = [
    { g: "A", x: 0.5, label: "A등급 품목구분 (전체)" },
    { g: "B", x: 4.55, label: "B등급 품목구분 (상위 5개)" },
    { g: "C", x: 8.6, label: "C등급 품목구분 (상위 5개)" },
  ];
  gradeCols.forEach((gc) => {
    slide.addText(gc.label, { x: gc.x, y: 3.3, w: 3.85, h: 0.28, fontFace: "Calibri", fontSize: 10.5, bold: true, color: NAVY });
    const gRows = [
      [
        { text: "품목구분", options: { bold: true, fill: { color: NAVY }, color: WHITE, fontSize: 8.5 } },
        { text: "금액", options: { bold: true, fill: { color: NAVY }, color: WHITE, align: "right", fontSize: 8.5 } },
        { text: "누적%", options: { bold: true, fill: { color: NAVY }, color: WHITE, align: "right", fontSize: 8.5 } },
      ],
    ];
    D.abc_items[gc.g].slice(0, 5).forEach((x) => {
      gRows.push([
        { text: x.name, options: { align: "left" } },
        { text: fmt(x.금액), options: { align: "right" } },
        { text: `${x.pct}%`, options: { align: "right", color: GRAY } },
      ]);
    });
    slide.addTable(gRows, {
      x: gc.x, y: 3.62, w: 3.85, colW: [1.85, 1.3, 0.7],
      fontSize: 8.5, fontFace: "Calibri", border: { type: "solid", color: ICE_L, pt: 0.75 }, autoPage: false, rowH: 0.3,
    });
    if (D.abc_items[gc.g].length > 5) {
      slide.addText(`외 ${D.abc_items[gc.g].length - 5}개 품목구분`, { x: gc.x, y: 3.62 + gRows.length * 0.3 + 0.06, w: 3.85, h: 0.25, fontFace: "Calibri", fontSize: 8, italic: true, color: GRAY });
    }
  });
  analysisCard(slide, 0.5, 5.85, 12.3,
    `분석: 상위 6개 품목구분(A등급)이 전체 지출의 ${D.abc_summary.A.pct_of_all}%를 차지합니다. 이 품목들에 구매 담당자의 협상·모니터링 역량을 집중하고, C등급(${D.abc_summary.C.count}개, ${D.abc_summary.C.pct_of_all}%)은 발주 프로세스를 간소화해 행정 부담을 줄이는 것을 권장합니다 (초안 — 담당자 확인 요망).`
  );
}

// ================= Slide 3-3: 정기계약(연간 단가계약) 전환 후보 =================
{
  const slide = contentSlide();
  titleBlock(slide, "3-3)", "구매전략 수립 예시 ③ — 정기계약 전환 후보");
  slide.addText(
    "→ 2026년 상반기 발주 건수가 많은(5건 이상) 업체입니다. 반복 발주가 잦은 업체는 건별 협상 대신 연간 단가계약(블랭킷 오더)으로 전환하면 행정 비용을 줄이고 단가도 안정시킬 수 있습니다.",
    { x: 0.5, y: 1.0, w: 12.3, h: 0.55, fontFace: "Calibri", fontSize: 10.5, italic: true, color: GRAY }
  );
  const rows = [
    [
      { text: "업체명", options: { bold: true, fill: { color: NAVY }, color: WHITE } },
      { text: "주요 품목구분", options: { bold: true, fill: { color: NAVY }, color: WHITE } },
      { text: "상반기 발주건수", options: { bold: true, fill: { color: NAVY }, color: WHITE, align: "right" } },
      { text: "상반기 금액", options: { bold: true, fill: { color: NAVY }, color: WHITE, align: "right" } },
      { text: "연환산(추정)", options: { bold: true, fill: { color: NAVY }, color: WHITE, align: "right" } },
    ],
  ];
  D.blanket_candidates.forEach((b) => {
    rows.push([
      { text: b.name, options: { align: "left", bold: true } },
      { text: b.주요품목, options: { align: "left", color: GRAY } },
      { text: `${b.건수}건`, options: { align: "right" } },
      { text: fmt(b.금액), options: { align: "right" } },
      { text: fmt(b.금액 * 2), options: { align: "right", color: GRAY } },
    ]);
  });
  slide.addTable(rows, {
    x: 0.5, y: 1.75, w: 9.2, colW: [2.1, 2.3, 1.6, 1.8, 1.4],
    fontSize: 10, fontFace: "Calibri", border: { type: "solid", color: ICE_L, pt: 0.75 }, autoPage: false, rowH: 0.42,
  });
  analysisCard(slide, 9.9, 1.75, 2.9,
    "전략: 발주 건수가 많을수록 건당 행정 비용(품의·검수·정산)이 누적됩니다. 상위 업체부터 연간 단가계약을 맺어 발주는 자동화하고, 담당자는 예외 상황 관리에 집중하는 방향을 권장합니다 (초안 — 담당자 확인 요망)."
  );
}

// ================= 품목구분별 집행금액 (월별 세부) =================
{
  const slide = contentSlide();
  titleBlock(slide, "4-1)", "품목구분별 집행 금액 (월별 세부)");
  const months = D.month_cols;
  const header = ["구분", ...months, "총합계"].map((h) => ({ text: h, options: { bold: true, fill: { color: NAVY }, color: WHITE, align: h === "구분" ? "left" : "right", fontSize: 9 } }));
  const rows = [header];
  rows.push([
    { text: "총합계", options: { bold: true, align: "left" } },
    ...D.monthly_cat_total.map((v) => ({ text: fmt(v), options: { bold: true, align: "right" } })),
    { text: fmt(D.total_amount), options: { bold: true, align: "right" } },
  ]);
  Object.keys(D.monthly_cat).forEach((cat) => {
    const vals = D.monthly_cat[cat];
    const sum = vals.reduce((a, b) => a + b, 0);
    rows.push([
      { text: cat, options: { align: "left", bold: cat === "그 외" } },
      ...vals.map((v) => ({ text: v ? fmt(v) : "", options: { align: "right" } })),
      { text: fmt(sum), options: { align: "right" } },
    ]);
  });
  slide.addTable(rows, {
    x: 0.5, y: 1.15, w: 12.3, colW: [2.3, 1.19, 1.19, 1.19, 1.19, 1.19, 1.19, 1.05, 1.5],
    fontSize: 8.5, fontFace: "Calibri", border: { type: "solid", color: ICE_L, pt: 0.75 }, autoPage: false, rowH: 0.29,
  });
  slide.addText("※ '기타'는 2026 상반기(1~6월) 범위 밖 발주일자 건입니다.", { x: 0.5, y: 1.15 + rows.length * 0.29 + 0.08, w: 6, h: 0.25, fontFace: "Calibri", fontSize: 8, italic: true, color: GRAY });
}

// ================= 품목구분별 상세 (top4) with YoY =================
D.cat_top_names.forEach((cat, i) => {
  const slide = contentSlide();
  titleBlock(slide, `4-${i + 2})`, `품목구분별 집행 금액 (${cat})`);
  const info = D.cat_items[cat];
  const rows = [
    [
      { text: "품목", options: { bold: true, fill: { color: NAVY }, color: WHITE } },
      { text: "수량", options: { bold: true, fill: { color: NAVY }, color: WHITE, align: "right" } },
      { text: "단가", options: { bold: true, fill: { color: NAVY }, color: WHITE, align: "right" } },
      { text: "금액", options: { bold: true, fill: { color: NAVY }, color: WHITE, align: "right" } },
    ],
  ];
  rows.push([{ text: "총합계", options: { bold: true } }, { text: "", options: {} }, { text: "", options: {} }, { text: fmt(info.total), options: { bold: true, align: "right" } }]);
  info.items.forEach((it) => {
    rows.push([
      { text: it[0], options: { align: "left" } },
      { text: it[1] !== null ? fmt(it[1]) : "", options: { align: "right" } },
      { text: it[2] !== null ? fmt(it[2]) : "", options: { align: "right" } },
      { text: fmt(it[3]), options: { align: "right" } },
    ]);
  });
  const catRowH = Math.min(0.3, 5.7 / rows.length);
  slide.addTable(rows, {
    x: 0.5, y: 1.05, w: 7.3, colW: [3.6, 1.2, 1.2, 1.3],
    fontSize: rows.length > 15 ? 8.5 : 9.5, fontFace: "Calibri", border: { type: "solid", color: ICE_L, pt: 0.75 }, autoPage: false, rowH: catRowH,
  });

  const yoyVals = D.cat_yoy[cat].map((v) => Math.round((v / 1e8) * 100) / 100);
  slide.addChart(pres.ChartType.bar, [{ name: cat, labels: D.periods, values: yoyVals }], {
    x: 8.1, y: 1.05, w: 4.7, h: 2.55, barDir: "col",
    chartColors: [NAVY, NAVY, NAVY, GOLD],
    showTitle: true, title: `${cat} 연도별 추이 (억원)`, titleFontSize: 10,
    showValue: true, dataLabelFormatCode: "0.0", dataLabelFontSize: 8.5, dataLabelColor: NAVY,
    catAxisLabelFontSize: 8.5, valAxisHidden: true,
    valGridLine: { style: "none" }, catGridLine: { style: "none" }, showLegend: false,
  });

  const mixColors = D.cat_chart.map((d) => (d[0] === cat ? GOLD : ICE));
  slide.addChart(pres.ChartType.bar, [{ name: "금액", labels: D.cat_chart.map((d) => d[0]), values: D.cat_chart.map((d) => Math.round((d[1] / 1e8) * 10) / 10) }], {
    x: 8.1, y: 3.75, w: 4.7, h: 3.0, barDir: "bar",
    chartColors: mixColors, showTitle: true, title: `품목구분별 집행금액 (2026상반기 전체 — 이 슬라이드: ${cat})`, titleFontSize: 9,
    showValue: false, catAxisLabelFontSize: 8, valAxisHidden: true,
    valGridLine: { style: "none" }, catGridLine: { style: "none" }, showLegend: false,
  });
});

// ================= 업체별 집행금액 (월별 세부) =================
{
  const slide = contentSlide();
  titleBlock(slide, "5-1)", "업체별 집행 금액 (월별 세부)");
  const months = D.month_cols;
  const header = ["업체명", ...months, "총합계"].map((h) => ({ text: h, options: { bold: true, fill: { color: NAVY }, color: WHITE, align: h === "업체명" ? "left" : "right", fontSize: 9 } }));
  const rows = [header];
  const vendMonthlyTotal = months.map((_, mi) => Object.values(D.monthly_vend).reduce((s, arr) => s + arr[mi], 0));
  rows.push([
    { text: "총합계", options: { bold: true, align: "left" } },
    ...vendMonthlyTotal.map((v) => ({ text: fmt(v), options: { bold: true, align: "right" } })),
    { text: fmt(D.total_amount), options: { bold: true, align: "right" } },
  ]);
  Object.keys(D.monthly_vend).forEach((v) => {
    const vals = D.monthly_vend[v];
    const sum = vals.reduce((a, b) => a + b, 0);
    rows.push([
      { text: v, options: { align: "left", bold: v === "그 외" } },
      ...vals.map((x) => ({ text: x ? fmt(x) : "", options: { align: "right" } })),
      { text: fmt(sum), options: { align: "right" } },
    ]);
  });
  slide.addTable(rows, {
    x: 0.5, y: 1.15, w: 12.3, colW: [2.3, 1.19, 1.19, 1.19, 1.19, 1.19, 1.19, 1.05, 1.5],
    fontSize: 8.5, fontFace: "Calibri", border: { type: "solid", color: ICE_L, pt: 0.75 }, autoPage: false, rowH: 0.29,
  });
  slide.addText("※ '기타'는 2026 상반기(1~6월) 범위 밖 발주일자 건입니다.", { x: 0.5, y: 1.15 + rows.length * 0.29 + 0.08, w: 6, h: 0.25, fontFace: "Calibri", fontSize: 8, italic: true, color: GRAY });
}

// ================= 업체별 상세 (top5) with YoY =================
D.vend_top_names.forEach((v, i) => {
  const slide = contentSlide();
  titleBlock(slide, `5-${i + 2})`, `업체별 집행 금액 (${v})`);
  const info = D.vend_items[v];
  slide.addText(`주요 품목구분: ${info.main_cat}`, { x: 0.5, y: 0.98, w: 7, h: 0.28, fontFace: "Calibri", fontSize: 10, color: GRAY });
  const rows = [
    [
      { text: "품목", options: { bold: true, fill: { color: NAVY }, color: WHITE } },
      { text: "수량", options: { bold: true, fill: { color: NAVY }, color: WHITE, align: "right" } },
      { text: "단가", options: { bold: true, fill: { color: NAVY }, color: WHITE, align: "right" } },
      { text: "금액", options: { bold: true, fill: { color: NAVY }, color: WHITE, align: "right" } },
    ],
  ];
  rows.push([{ text: "총합계", options: { bold: true } }, { text: "", options: {} }, { text: "", options: {} }, { text: fmt(info.total), options: { bold: true, align: "right" } }]);
  info.items.forEach((it) => {
    rows.push([
      { text: it[0], options: { align: "left" } },
      { text: it[1] !== null ? fmt(it[1]) : "", options: { align: "right" } },
      { text: it[2] !== null ? fmt(it[2]) : "", options: { align: "right" } },
      { text: fmt(it[3]), options: { align: "right" } },
    ]);
  });
  const vendRowH = Math.min(0.3, 5.4 / rows.length);
  slide.addTable(rows, {
    x: 0.5, y: 1.35, w: 7.3, colW: [3.6, 1.2, 1.2, 1.3],
    fontSize: rows.length > 15 ? 8.5 : 9.5, fontFace: "Calibri", border: { type: "solid", color: ICE_L, pt: 0.75 }, autoPage: false, rowH: vendRowH,
  });

  const yoyVals = D.vend_yoy[v].map((x) => Math.round((x / 1e8) * 100) / 100);
  slide.addChart(pres.ChartType.bar, [{ name: v, labels: D.periods, values: yoyVals }], {
    x: 8.1, y: 1.05, w: 4.7, h: 2.55, barDir: "col",
    chartColors: [NAVY, NAVY, NAVY, GOLD],
    showTitle: true, title: `${v} 연도별 추이 (억원)`, titleFontSize: 10,
    showValue: true, dataLabelFormatCode: "0.0", dataLabelFontSize: 8.5, dataLabelColor: NAVY,
    catAxisLabelFontSize: 8.5, valAxisHidden: true,
    valGridLine: { style: "none" }, catGridLine: { style: "none" }, showLegend: false,
  });

  const mixColorsV = D.vend_chart.map((d) => (d[0] === v ? GOLD : ICE));
  slide.addChart(pres.ChartType.bar, [{ name: "금액", labels: D.vend_chart.map((d) => d[0]), values: D.vend_chart.map((d) => Math.round((d[1] / 1e8) * 10) / 10) }], {
    x: 8.1, y: 3.75, w: 4.7, h: 3.0, barDir: "bar",
    chartColors: mixColorsV, showTitle: true, title: `업체별 집행금액 (2026상반기 전체 — 이 슬라이드: ${v})`, titleFontSize: 9,
    showValue: false, catAxisLabelFontSize: 8, valAxisHidden: true,
    valGridLine: { style: "none" }, catGridLine: { style: "none" }, showLegend: false,
  });
});

// ================= 추가 분석 6-1: 월별 발주 패턴 (계절성) =================
{
  const slide = contentSlide();
  titleBlock(slide, "6-1)", "추가 분석 — 월별 발주 패턴 (계절성)");
  slide.addText(
    "→ 2026년 상반기 월별 총 집행금액입니다. 특정 월에 지출이 몰리는 패턴을 미리 파악해두면 예산·현금흐름 계획에 반영할 수 있습니다.",
    { x: 0.5, y: 1.0, w: 12.3, h: 0.4, fontFace: "Calibri", fontSize: 10.5, italic: true, color: GRAY }
  );
  const seasonScaled = D.seasonality.values.map((v) => Math.round((v / 1e8) * 100) / 100);
  slide.addChart(pres.ChartType.bar, [{ name: "금액", labels: D.seasonality.labels, values: seasonScaled }], {
    x: 0.5, y: 1.5, w: 7.6, h: 4.9, barDir: "col",
    chartColors: D.seasonality.labels.map((l) => (l === D.seasonality.peak_month ? GOLD : NAVY)),
    showTitle: true, title: "월별 총 집행금액 (억원)", titleFontSize: 12,
    showValue: true, dataLabelFormatCode: "0.0", dataLabelFontSize: 10, dataLabelColor: NAVY, dataLabelBold: true,
    catAxisLabelFontSize: 10, valAxisHidden: true,
    valGridLine: { style: "none" }, catGridLine: { style: "none" }, showLegend: false,
  });
  slide.addShape(pres.ShapeType.roundRect, { x: 8.3, y: 1.5, w: 4.5, h: 1.5, rectRadius: 0.06, fill: { color: ICE_L }, line: { type: "none" } });
  slide.addShape(pres.ShapeType.rect, { x: 8.3, y: 1.5, w: 0.08, h: 1.5, fill: { color: GOLD }, line: { type: "none" } });
  slide.addText("최다 지출월", { x: 8.52, y: 1.62, w: 4.0, h: 0.3, fontFace: "Calibri", fontSize: 10, color: GRAY });
  slide.addText(D.seasonality.peak_month, { x: 8.52, y: 1.9, w: 4.0, h: 0.4, fontFace: "Cambria", fontSize: 20, bold: true, color: NAVY });
  slide.addText(`${fmt(D.seasonality.peak_amt)}원`, { x: 8.52, y: 2.35, w: 4.0, h: 0.3, fontFace: "Calibri", fontSize: 11, color: TXT });
  slide.addText(
    "주요 품목: " + D.seasonality.peak_drivers.map((d) => `${d.name}(${eok(d.금액)})`).join(", "),
    { x: 8.52, y: 2.65, w: 4.0, h: 0.3, fontFace: "Calibri", fontSize: 9, color: GRAY }
  );
  analysisCard(slide, 8.3, 3.2, 4.5,
    `분석: ${D.seasonality.peak_month}에 지출이 집중되는 경향이 있어, 해당 시기 예산을 미리 확보하고 주요 품목(비료·농약 등 계절성 자재)의 발주를 앞당겨 검토하는 것을 권장합니다 (초안 — 담당자 확인 요망).`
  );
}

// ================= 추가 분석 6-2: 연도별 신규·이탈 거래업체 =================
{
  const slide = contentSlide();
  titleBlock(slide, "6-2)", "추가 분석 — 연도별 신규·이탈 거래업체");
  slide.addText(
    "→ 신규: 2026년 상반기에 처음 등장한 업체. 이탈: 2023~2025년엔 거래했으나 2026년 상반기엔 거래 기록이 없는 업체(상위 금액 기준)입니다.",
    { x: 0.5, y: 1.0, w: 12.3, h: 0.4, fontFace: "Calibri", fontSize: 10.5, italic: true, color: GRAY }
  );
  slide.addText(`신규 거래업체 (총 ${D.new_vendor_count}곳 중 상위)`, { x: 0.5, y: 1.5, w: 6, h: 0.3, fontFace: "Calibri", fontSize: 11, bold: true, color: NAVY });
  const newRows = [
    [
      { text: "업체명", options: { bold: true, fill: { color: NAVY }, color: WHITE } },
      { text: "2026상반기 금액", options: { bold: true, fill: { color: NAVY }, color: WHITE, align: "right" } },
    ],
  ];
  D.new_vendors.forEach((v) => newRows.push([{ text: v.name, options: { align: "left" } }, { text: fmt(v.금액), options: { align: "right" } }]));
  slide.addTable(newRows, {
    x: 0.5, y: 1.82, w: 5.9, colW: [3.5, 2.4],
    fontSize: 9, fontFace: "Calibri", border: { type: "solid", color: ICE_L, pt: 0.75 }, autoPage: false, rowH: 0.32,
  });

  slide.addText(`이탈 거래업체 (총 ${D.churned_vendor_count}곳 중 상위, 2023~2025 거래액)`, { x: 6.7, y: 1.5, w: 6, h: 0.3, fontFace: "Calibri", fontSize: 11, bold: true, color: NAVY });
  const churnRows = [
    [
      { text: "업체명", options: { bold: true, fill: { color: NAVY }, color: WHITE } },
      { text: "과거 거래액", options: { bold: true, fill: { color: NAVY }, color: WHITE, align: "right" } },
    ],
  ];
  D.churned_vendors.forEach((v) => churnRows.push([{ text: v.name, options: { align: "left" } }, { text: fmt(v.금액), options: { align: "right" } }]));
  slide.addTable(churnRows, {
    x: 6.7, y: 1.82, w: 5.9, colW: [3.5, 2.4],
    fontSize: 9, fontFace: "Calibri", border: { type: "solid", color: ICE_L, pt: 0.75 }, autoPage: false, rowH: 0.32,
  });

  analysisCard(slide, 0.5, 5.65, 12.3,
    `분석: 이탈 업체 중 금액 규모가 컸던 곳은 거래 중단 사유(가격/품질/계약 종료 등)를 확인해둘 필요가 있습니다. 신규 업체는 아직 거래 이력이 짧으므로 품질·납기 검증을 병행하는 것을 권장합니다 (초안 — 담당자 확인 요망).`
  );
}

pres.writeFile({ fileName: "./output.pptx" }).then(() => {
  console.log("done, total slides:", pres.slides.length);
});
