# HILLMARU 기획감사 Unit (Plugin)

HILLMARU 기획감사 Unit 팀 4명을 서브에이전트로, 팀에서 쓰던 실무 스킬 7종을 함께 담은 Cowork/Claude Code 플러그인입니다.

## 포함된 에이전트

| 이름 | 역할 | 파일 |
|---|---|---|
| 이깜디 (과장) | Unit장 · 팀 결과 총괄/취합, 최종 보고서 아웃라인 | `agents/leekumdi.md` |
| 이쿠키 (사원) | 구매·데이터 분석 (xlsx) | `agents/leecookie.md` |
| 김링키 (사원) | 감사·법규 검토 (pdf/docx) | `agents/kimlinky.md` |
| 김띨추 (사원) | 기획·보고 검토 (pptx/hwp/docx) | `agents/kimttilchu.md` |

각 에이전트는 파일 형식과 요청 맥락에 따라 Claude가 자동으로 호출하며, `@에이전트이름`으로 직접 지정해 부를 수도 있습니다 (예: `hillmaru-planning-audit-unit:leekumdi`).

## 포함된 스킬

| 스킬 | 용도 | 배정된 에이전트 |
|---|---|---|
| `hillmaru-pocheon-price-comparison` | 포천 구매품목 단가비교 엑셀 생성 | 이쿠키 |
| `hillmaru-purchase-performance-report` | 구매 실적 취합 PPT 보고서 생성 | 이쿠키 |
| `hillmaru-quote-to-po` | 견적서 PDF → 발주서 엑셀 변환 | 이쿠키 |
| `hillmaru-changnyeong-course-report` | 창녕 코스 컨디션 점검 PPT 보고서 생성 | 김띨추 |
| `hillmaru-donghoon-draft-proposal` | (주)동훈 그룹웨어(a10.donghoon.com)에서 지출_구매/대금지급요청 기안 초안 작성 + 보관, 발주서 자동완성 | 이쿠키 |
| `hillmaru-quote-system-maintenance` | 힐마루 견적관리시스템(server.js, 구매 견적요청→발주서 관리 웹앱) 기능 추가·버그 수정·유지보수 | 이쿠키, 이깜디 |
| `hillmaru-monthly-report-maintenance` | 힐마루 월간 경영보고 시스템(hillmaru-monthly-report, 부서별 실적 입력 + 관리자 취합 웹앱) 기능 추가·버그 수정·유지보수 | 이깜디 |

각 에이전트 md 파일의 `skills:` frontmatter 필드에 스킬이 지정되어 있어, 해당 스킬의 전체 내용이 에이전트 시작 시점에 컨텍스트로 미리 로드됩니다. 김링키는 배정된 스킬이 없습니다.

### 그룹웨어 기안 작성 스킬 사용법

작업 폴더에 아래 이름 규칙으로 폴더를 만들어 자료를 넣어두면 이쿠키가 자동으로 기안 초안을 작성해 그룹웨어 임시보관문서함에 저장합니다.

- `[날짜]_[사업장]_[부서/품목] 구매` — 업체별 견적서 PDF를 넣어두면 지출_구매 기안 작성. 결재 보관 후 발주서 양식(xlsx)을 추가하면 자동으로 발주서까지 완성.
- `[날짜]_[사업장]_[부서/품목] 구매_인터넷 구매` — 견적서 대신 웹서치로 시세를 조사해 기안 작성.
- `대금 지급 요청_[날짜]` — 정리된 엑셀을 넣어두면 대금 지급 요청 기안 작성.

**실제 결재 상신(제출)은 절대 자동으로 하지 않습니다.** 항상 "보관" 단계까지만 진행하고, 최종 상신은 사용자가 직접 합니다. 그룹웨어 접속은 Claude in Chrome 확장(연결된 브라우저)이 이미 로그인돼 있어야 동작합니다.

## 설치 방법

1. 이 폴더(`hillmaru-planning-audit-unit/`) 전체를 로컬 마켓플레이스 저장소나 원하는 경로에 둡니다.
2. Cowork: 사이드바 **사용자 지정(Customize) → Plugins → Add**에서 `.plugin` 패키지 파일을 업로드합니다.
3. Claude Code: `claude --plugin-dir /path/to/hillmaru-planning-audit-unit` 로컬 경로로 바로 쓰거나, 마켓플레이스에 등록해 `claude plugin install hillmaru-planning-audit-unit@<marketplace>`로 설치합니다.
4. 설치 후 `claude plugin validate ./hillmaru-planning-audit-unit`로 구조를 검증할 수 있습니다.

## 성과 기록 (team-status.json)

각 에이전트는 작업을 마치면 실행 중인 작업 폴더의 `team-status.json`에 점수를 누적하고 로그를 남깁니다. 해당 파일이 없으면 `assets/team-status.template.json`을 그대로 복사해 자동 생성합니다.

- `promotion_thresholds`의 랭크별 기준 점수는 예시값이니 실제 인사 기준에 맞게 수정해서 쓰세요.
- 누적 점수가 현재 rank 기준을 넘으면 자동 승진 처리하지 않고, 항상 사용자에게 승인 여부를 먼저 묻습니다.

## 참고

각 에이전트/스킬이 다루는 파일 형식에 필요한 파이썬 패키지(pdfplumber, python-docx, python-pptx, pyhwp, pandas, openpyxl 등)는 최초 실행 시 없으면 `--break-system-packages` 옵션으로 설치하도록 안내되어 있습니다.
