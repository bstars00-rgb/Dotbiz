/* CEO Decision List xlsx generator — 2026-05-08 v2 */
const xlsx = require('xlsx');

const wb = xlsx.utils.book_new();

/* ═════════════════════════════════════════════════════════════
 * Sheet 1: 결재 필요
 * ═════════════════════════════════════════════════════════════ */
const sheet1 = [
  ["DOTBIZ 채널 — 대표이사 결재 필요 항목 + Sage 권장안", "", "", "", "", "", ""],
  ["Settlement + Market Research 통합 — 미결정 항목 (2026-05-08 PM, 결제 전략 v3 반영)", "", "", "", "", "", ""],
  ["", "", "", "", "", "", ""],
  ["우선순위", "분류", "결정 항목", "현재 상태 / 옵션", "영향 / 사유", "협업 부서", "Sage 권장안 (CFO 대안)"],

  ["1", "PG 전략",
    "Local PG 도입 우선순위 + 협상 책임자",
    "한국 PG 3사 (Toss / KG이니시스 / KCP) 견적 미입수. 가상계좌 250원 / 카드 2.1~3.3% 실측 확보 완료",
    "결제 수수료 마진 직격 (마진 4% 기준). 글로벌 PG 3.5% vs Local PG 2% → 1.5%p 절감 가능. 한국 시장 매출 비중 큼",
    "CFO + KR 지사",
    "[권장] 한국 1순위 즉시 착수\n• 1순위: 한국 Toss Payments (가상계좌 250원 표준, 협의 조건 우호적)\n• 2순위: 중국 Alipay/WeChat (홍콩 지사 오픈 후)\n• 3순위: 베트남 VNPay → 일본 GMO\n• 책임자: 한국 지사장 + 본사 CFO 이중 트랙\n• 예상 절감: 한국 권역 PG 3.5% → 0.025~2.8% (수단별)"
  ],

  ["2", "지사 운영",
    "홍콩 지사 오픈 일정 + Alipay/WeChat 협상 책임자",
    "홍콩 지사 오픈 예정 (시점 미정). 대중화권 직접 진출의 핵심. Alipay/WeChat B2B 협상 미시작",
    "대중화권 (중국·대만·홍콩) 시장 진입 전제 조건. 미오픈 시 SG 본사 직접 결제 (cross-border 부담). 대중화권 잠재 매출 비중 30%+ 예상",
    "CEO + HK 준비팀",
    "[권장] 2026 Q3 오픈 목표\n• 준비: SG 본사 + HK 사무소 두 트랙 동시 진행\n• Alipay 협상: B2B 머천트 계정 (1~2% 협상 목표, Trip.com Trade 벤치마크)\n• WeChat Pay: HK 지사 명의 가능\n• FPS (홍콩 표준 즉시결제 0%): 우선 도입\n• 책임자: HK 지사장 + SG 본사 CFO\n• 백업: 미오픈 시 Eximbay 0.2~5%로 임시 운영"
  ],

  ["3", "BM / 신용",
    "PREPAY → POSTPAY 자동 전환 트리거 임계값",
    "4단계 Migration Path 정의 완료 (Stage 0 PREPAY → Stage 1 Floating Deposit → Stage 2 Bank Guarantee → Stage 3 No Deposit). 자동 전환 트리거 임계값 미확정",
    "DOTBIZ 핵심 BM. 너무 늦으면 거래량 한계 (PREPAY는 자금 부담), 너무 빠르면 신용 리스크. 자연스러운 매출 확대 유도가 관건",
    "CFO + ELLIS 운영",
    "[권장] 4조건 AND 충족 시 자동 제안\n• 거래 기간 ≥ 6개월\n• 월 평균 예약 ≥ 5건\n• TTV 12개월 누적 ≥ 1억원\n• Free Cancel 비율 ≥ 90% AND 60일+ Overdue 0건\n• 자동 평가서 + Master 추천 → EllisOP 검토\n• 자동 평가 알고리즘: 100점 만점 (각 20점 + 평판 점수), 60점 이상 자동 제안"
  ],

  ["4", "보험 / 신용",
    "Trade Credit Insurance 도입 결정",
    "웹 리서치 실측: 보험료 0.1~0.5% (Atradius 95% retention 50개국 / Coface 100개국 €685B). No Deposit 대안 검토 완료. 호텔업 사례 직접 확인 미진행",
    "No Deposit 게임체인저. PG 3.5% 대비 보험료 0.5%로 7배 저렴. 대형 고객 신용 거래 안전망. 부도 리스크 보험사 전가",
    "CFO + 보험사",
    "[권장] Atradius 우선 컨택 (SG 사무소)\n• 1순위: Atradius (95% retention, 50개국 네트워크)\n• 2순위: Coface (€685B 보장, 글로벌 표준)\n• 견적 비교 2주 → 1개 사 채택\n• No Deposit 신규 신청 시 의무 가입\n• 보험료는 고객사 부담 또는 DOTBIZ 흡수 (CFO 후속 결정)\n• 예상 도입 효과: No Deposit 신청 처리 자동화 + 손실 리스크 -90%"
  ],

  ["5", "신규 결제",
    "Pre-funded Wallet 인센티브 비율",
    "도입 검토 완료. '$1만 충전 시 X% 보너스 ELS' 모델. 비율 미정",
    "운영자금 확보 + AR 리스크 0% (선충전). 비율 잘못 설계 시 ELS 경제 압박 (마진 부담). 항공사 마일리지 충전 UX 차용",
    "CFO + ELS팀",
    "[권장] 3단계 인센티브 모델\n• 1단계 (3~6개월 PoC): 충전액의 3% 보너스 ELS\n• 2단계: Tier별 차등 (Bronze 3% / Silver 4% / Gold 5% / Platinum 6% / Emerald 7% / Diamond 8%)\n• 3단계: 자동 충전 (월 자동 결제) 시 추가 1% 보너스\n• 캡: 월 충전 한도 $5만 (악용 방지)\n• 예상 효과: 운영자금 +20% (3개월 내), AR 회수 부담 -40%"
  ],

  ["6", "보안",
    "PCI-DSS 인증 일정 + 예산 책정",
    "별도 트랙 신설 (2026-05-08 결재). 일정·예산 미정. 보안 강화 필요 (대표이사 의견)",
    "결제 처리 법적 필수. 인증 없이는 카드 정보 직접 보유 불가 → PG 의존도 ↑. 글로벌 시장 진출의 필수 조건",
    "보안 + IT + 외부 감사",
    "[권장] 2026 Q4 인증 완료 목표\n• Q3: 외부 감사 시작 (Approved QSA 선정)\n• Q4: 인증 완료 + 갱신 계약\n• 예산: $30K~50K (1차 감사 + 컨설팅)\n• 갱신: 매년 약 $15K\n• 단계: Level 4 (소규모) → Level 1 (대형)\n• 병행 작업: 결제 토큰화 (Stripe Vault 등) + 2FA + Audit Log\n• Ratehawk 'Pay By Link' 차용 시 부담 ↓"
  ],

  ["7", "Hotel Boost",
    "호텔 자부담 100% 정책 도입",
    "MAX_HOTEL_BOOST 1.25× 운영 중 (실질 마진 6.06%). 호텔 자부담 비율 필드 미신설. 현재 DOTBIZ 흡수 가능성 잔존",
    "마진 4% 환경에서 DOTBIZ 흡수 불가 (역마진 위험). 호텔 마케팅 예산 활용으로 자부담 100% 강제 필요",
    "SCM + 호텔 영업",
    "[권장] 자부담 100% 강제 정책 도입\n• hotelFundedPct 필드 신설 (HotelPointsBoost 인터페이스)\n• 100% 미만 등록 시 시스템 거부 (toast 에러)\n• 호텔 영업 시 사전 설명: '마케팅 예산으로 ELS 보너스 100% 부담'\n• 회계 분리: boost 적립분 → 호텔 차감 (월 정산)\n• 예외: SCM 협상 시 임시 50% 허용 옵션 (대표이사 결재)"
  ],

  ["8", "모니터링",
    "마진 4% 환경 핵심 KPI 대시보드",
    "마진 모니터링 대시보드 미설계. CFO 운영 위임 (2026-05-08 결재) 후 구체화 필요",
    "마진 4% 압박 환경에서 실시간 추적 필수. JPY 70% 집중 / 권역별 Net Margin 변동 / 결제수단별 비중 변화 추적",
    "CFO + 데이터팀",
    "[권장] 5종 핵심 KPI + 알림 임계값\n• 권역별 Net Margin (한국/대중화/동남아/SG·MY/일본) — 1.5% 미만 시 알림\n• 결제수단별 거래 비중 (가상계좌 vs 카드 vs QR vs 송금) — 카드 30% 초과 시 알림\n• 통화별 매출 비중 (JPY 집중도 모니터링) — JPY 70%+ 시 분산 전략 제안\n• AR Aging 회수율 (1-30/31-60/61-90) — 31-60일 비중 10%+ 시 알림\n• 분쟁 건수 월별 (현재 SLA: 50건 트리거)"
  ],

  ["", "", "", "", "", "", ""],
  ["권장 처리 순서: 1번 → 2번 → 3번 (BM 핵심, 즉시 착수) → 4·5번 (재무 안정성) → 6·7·8번 (운영 인프라). 1번·2번·3번은 CFO 협업 후 1주 내 결재 권장. 나머지는 4주 내.", "", "", "", "", "", ""],
];

const ws1 = xlsx.utils.aoa_to_sheet(sheet1);
ws1['!cols'] = [
  { wch: 8 }, { wch: 12 }, { wch: 30 }, { wch: 40 }, { wch: 35 }, { wch: 15 }, { wch: 65 },
];
xlsx.utils.book_append_sheet(wb, ws1, '결재 필요');

/* ═════════════════════════════════════════════════════════════
 * Sheet 2: 보지 않아도 됨 — 결재 완료 항목
 * ═════════════════════════════════════════════════════════════ */
const sheet2 = [
  ["DOTBIZ 채널 — 대표이사 검토 불필요 항목 + Sage 모니터링 의견", "", "", "", ""],
  ["결재 완료 + 마켓 리서치 + 코드 구현 항목. 2026-05-06 ~ 2026-05-08 누적", "", "", "", ""],
  ["", "", "", "", ""],

  ["✅ 2026-05-07 1단계 결재 완료 (8건, CEO)", "", "", "", ""],
  ["분류", "항목", "결정 / 상태", "비고", "Sage 모니터링 의견"],
  ["가격 / 수수료", "PG 수수료 부담 주체", "1단계: DOTBIZ 부담 → 2단계 무효화", "→ 2026-05-08 PM '100% 고객 부담'으로 정책 변경", "정책 변경 영구 기록 (POLICY_CHANGELOG)"],
  ["분쟁", "분쟁 자동 인정", "자동 인정 없음", "모든 분쟁 수동 검토", "월 50건 초과 시 인력 증원 트리거"],
  ["디포짓", "No Deposit 적용", "대표이사 승인 (케이스별)", "정량 3 + 정성 2 충족", "Sheet 1 #4 Trade Credit Insurance와 연계"],
  ["통화", "신규 통화 추가", "소스마켓 추가 시", "신규 시장 진출 결재와 동시", ""],
  ["신용 / AR", "Net-30 상한", "45일까지 (TTV 5억+ 케이스별)", "60일 절대 초과 금지", "AR Aging 60일 트리거 단계 추가됨 (2단계)"],
  ["환율 / 회계", "환차손 처리", "분기 정산 (자연헷지 + 3개월 Forward)", "CFO 운영", "Sheet 1 #8 KPI 대시보드에서 JPY 70% 집중 모니터링"],
  ["신용 / AR", "90+일 Write-off", "대표이사 결재", "—", ""],
  ["디포짓", "디포짓 종류", "6종 유지", "Credit / Floating / Guarantee / Insurance / Bank Guarantee / No Deposit", "장기적 4종 통합 검토 (Insurance + Bank Guarantee)"],

  ["", "", "", "", ""],
  ["✅ 2026-05-08 AM 2단계 결재 완료 (8건, Sage 권장안 채택)", "", "", "", ""],
  ["분류", "항목", "결정 / 상태", "비고", "Sage 모니터링 의견"],
  ["PG 수수료", "PG 흡수 모델 Tier별 차등", "무효화 (5-08 PM)", "→ 100% 고객 부담 정책으로 대체", "변경 영구 기록"],
  ["환율 헷징", "자연헷지 + 3개월 Forward", "확정", "JPY 매출-비용 매칭 + 50% Forward", "JPY 70% 집중 분산 KPI 추적"],
  ["신용 동결", "2단계 트리거 (60/90일)", "확정", "60일 신용 한도 50% 축소 / 90일 완전 동결", "AR Aging UI 반영 완료"],
  ["Net-45 결재", "TTV 5억+ 대표이사 / 미만 Master 위임", "확정", "월 TTV 기준 차등", ""],
  ["No Deposit 기준", "정량 3 + 정성 2", "확정", "TTV 10억+/24개월+/Overdue 0건 + 평판/면담", "12개월마다 재평가"],
  ["No Deposit 양식", "자동 평가서 + 결재 양식 통합", "확정", "ELLIS Admin 양식 표준", "Sheet 1 #4와 연계"],
  ["분쟁 결재선", "4단계 ($1K/$10K/$50K/$50K+)", "확정", "Master / 양인 / EllisOP / 대표이사", ""],
  ["분쟁 SLA", "영업시간 + Critical 24x7 별도", "확정", "High 4h / Medium 24h / Low 72h / Critical 즉시", "월 50건 초과 시 증원 트리거"],

  ["", "", "", "", ""],
  ["✅ 2026-05-08 PM Critical Update + 정책 변경 (10건)", "", "", "", ""],
  ["분류", "항목", "결정 / 상태", "비고", "Sage 모니터링 의견"],
  ["마진 가정", "Gross Margin 3.5~4% (7%에서 하향)", "재계산 완료", "모든 비용 모델 재계산", "실측 데이터 + 권역별 Net Margin 추적"],
  ["PG 부담 정책", "100% 고객 부담 (정책 전면 변경)", "확정", "이전 흡수 정책 3건 모두 무효화", "변경 이력 영구 기록"],
  ["가격 표시", "Option C Hybrid (Booking-style)", "확정", "검색 단일가 + 결제 단계 분리 + 인보이스 라인 분리", "고객 결제수단 선택 자유 보장"],
  ["결제 매트릭스", "정산 × 예약 × 결제수단", "확정 + 코드 구현", "POSTPAY 결제수단 숨김 / PREPAY+NR 즉시결제만", "BookingFormPage 반영 완료"],
  ["PREPAY→POSTPAY 전환", "4단계 Migration Path", "확정 (자동 트리거 미정)", "Stage 0 PREPAY → Stage 3 No Deposit", "Sheet 1 #3에서 트리거 임계값 결재"],
  ["본사·지사 구조", "Model C Hybrid (현지 지사 수금 + SG 정산)", "확정", "SG 본사 / KR·JP·VN·(HK) 지사", "내부 정산 회계 정책 (CFO)"],
  ["권역별 결제수단", "17종 카탈로그 + 6 권역", "확정 + 코드 구현", "한국·대중화·동남아·SG+MY·일본·글로벌", "권역별 추천·자동 매핑"],
  ["Hotel Boost", "MAX 1.25× (마진 4% 안전)", "확정", "Diamond+1.25× = 실질 마진 6.06%", "Sheet 1 #7에서 호텔 자부담 100% 정책 결재"],
  ["보안", "강화 트랙 신설 (별도 예산)", "확정", "PCI-DSS / 침투 테스트 / 토큰화 / 2FA", "Sheet 1 #6에서 일정·예산 결재"],
  ["TBO/Ratehawk 벤치마크", "TBO 분리 + Ratehawk 포함 = Hybrid 채택", "확정", "Option C가 두 패턴 결합", "시장 검증된 모델"],

  ["", "", "", "", ""],
  ["📊 2026-05-08 마켓 리서치 결과 (실측 데이터)", "", "", "", ""],
  ["분류", "항목", "실측 데이터", "비고", "Sage 모니터링 의견"],
  ["한국 PG", "가상계좌 / 신용카드", "건당 250원 (0.025%) / 2.1~3.3%", "KG이니시스 / KCP / 토스 / 나이스페이 (시장 70%)", "Sheet 1 #1 우선 도입 대상"],
  ["글로벌 PG", "Stripe 일본 / Eximbay", "3.6% + 1.5% 국제 / 0.2~5%", "Stripe 일본은 마진 4% 잠식 확정", "Local PG 대체 필수"],
  ["중국", "Alipay/WeChat 국제카드", "3% (RMB 200+)", "B2B 머천트는 1~2% 협상 가능", "Trip.com Trade 모델 학습"],
  ["Trade Credit Insurance", "Atradius / Coface", "0.1~0.5% (일반)", "No Deposit 대안으로 PG 3.5% 대비 7배 저렴", "Sheet 1 #4 결재 대상"],
  ["B2B BNPL", "Hokodo 폐업 (2025-11)", "대안: Billie / Mondu / Resolve", "유럽 핀테크 시장 변동성 큼", "중장기 검토 (1순위 아님)"],
  ["WebBeds 결제", "Net-21 + Floating Deposit/Bank Guarantee", "—", "DOTBIZ Net-30보다 엄격", "참고 자료"],
  ["Ratehawk 결제", "Net rate + Pay By Link 신규", "—", "에이전트가 고객에게 결제 링크 전송", "DOTBIZ 차용 권장 (PCI-DSS 부담 ↓)"],
  ["DIDA Travel", "B2B 진입비 / 커미션 무료", "—", "100K+ 호텔 직접 계약", "DIDA Gap Analysis 자료 일치"],

  ["", "", "", "", ""],
  ["💳 비-PG 결제 수단 리서치 완료 (15종 / 5 카테고리)", "", "", "", ""],
  ["카테고리", "결제 수단", "수수료 (실측)", "도입 우선순위", "Sage 모니터링 의견"],
  ["Bank-based", "국내 송금 / 가상계좌 / SWIFT", "0% / 0.5~1% / 0.1%+정액", "🟢 Phase 1 즉시", "한국 가상계좌 표준 채택"],
  ["Credit-based", "Open Account / Trade Credit Insurance / B2B BNPL", "0% / 0.2~0.5% / 1~3%", "🟢 Phase 1~2", "Sheet 1 #4와 직결"],
  ["Collateral", "Bank Guarantee / LC / Escrow", "1~2%/년 / 0.5~1% / 0.5~2%", "🟢 디포짓 6종에 포함", "운영 중"],
  ["Pre-funded", "Wallet / Top-up Credit / Virtual Card", "0% / 0~1% / 1~2%", "🟢 Phase 1 인센티브 도입", "Sheet 1 #5와 직결"],
  ["Alternative", "Alipay·WeChat / PayNow / UPI / Crypto", "1~2% / 0% / 0% / 0.1~1%", "🟢 Phase 2 (중국·SG·MY)", "Sheet 1 #2와 연계 (홍콩 지사)"],

  ["", "", "", "", ""],
  ["✅ 구조 검수 완료 (Architecture)", "", "", "", ""],
  ["분류", "항목", "결정 / 상태", "비고", "Sage 모니터링 의견"],
  ["정산 모델", "PREPAY / POSTPAY 이원화", "확정", "하이브리드 없음, 단방향 흐름", ""],
  ["회계 기준", "Cash basis", "확정", "입금일 기준 인식", "IPO 단계에서 Accrual 병행 검토"],
  ["환율", "FX lock at booking", "확정", "예약 시점 환율 영구 고정", ""],
  ["AR Aging", "6 buckets + 60일/90일 2단계 동결", "확정", "신용 동결 트리거 통합", "Sheet 1 #8 KPI 추적"],
  ["통화", "USD / KRW / JPY / CNY / VND / SGD", "운영 중", "6통화 동시 운영", "JPY 70% 집중 → 분산 전략 필요"],
  ["보존", "7년", "법정 준수", "전자세금계산서법", ""],
  ["Voucher", "QR 미사용", "결정", "호텔 시스템 의존 X", "QR 요구 호텔 대안 voucher 정책 명확화"],
  ["자동 발송", "ELLIS 백엔드", "확정", "DOTBIZ는 read-only", "백엔드 장애 시 컨틴전시 플랜 필요"],
  ["권한 (RBAC)", "Master/Accounting/EllisOP 3분리", "확정", "Cross-tenant 차단", ""],
  ["진실 소스", "InvoiceWithMatch (단일)", "확정", "수정 불가, 취소 후 재예약만", ""],

  ["", "", "", "", ""],
  ["💻 코드 구현 완료 (2026-05-08)", "", "", "", ""],
  ["영역", "구현 내용", "파일", "비고", "Sage 모니터링 의견"],
  ["도메인 모델", "PaymentMethodOption + 17종 카탈로그", "mocks/settlement.ts", "Region·Category 유니언", "신규 결제수단 추가 시 자동 매핑"],
  ["UI", "PaymentMethodSelector + PaymentMethodCard", "BookingFormPage.tsx", "권역별 그룹 + 즉시결제 분기", "Master 권한 전 권역 표시"],
  ["UI", "POSTPAY 안내 카드 (결제수단 숨김)", "BookingFormPage.tsx", "디포짓 기반 안내", "POSTPAY 사용자 UX 단순화"],
  ["UI", "Invoice 라인 분리 (Hotel + Payment Fee)", "BookingCompletePage / SettlementDetailPage", "Option C Hybrid 반영", "회계 투명성"],
  ["권역 자동 매핑", "regionFromCountry()", "BookingFormPage.tsx", "user.company → country → region", "다권역 운영 대응"],
  ["데모 계정", "대중화권 3종 추가", "AuthContext.tsx", "china/taiwan/hk @dotbiz.com", "영업 데모 + UI 검증"],
  ["안정성", "Chunk 404 자동 reload + index.html 캐시 비활성", "main.tsx / index.html", "배포 후 stale cache 자동 복구", "재배포 시 자동 동작"],

  ["", "", "", "", ""],
  ["✅ 운영 룰 표준 (실무팀 자동 처리)", "", "", "", ""],
  ["분류", "항목", "결정 / 상태", "비고", "Sage 모니터링 의견"],
  ["POSTPAY 주기", "Monthly / Bi-weekly / Weekly", "운영", "계약별 협의", ""],
  ["PREPAY 결제 분기", "TL 분기 송금/카드", "운영 + 코드 반영", "Non-refundable은 즉시 결제 수단만", ""],
  ["AR 단계별 알림", "1-30 / 31-60 / 60일 동결 / 61-90 / 90일 완전동결", "자동화", "법무 검토는 90+일", "Sheet 1 #8 KPI 통합"],
  ["Credit Note", "원본 Invoice 수정 X, 별도 발행", "원칙", "재무 감사 대응", ""],
  ["Dispute 사유", "영구 보존 (status 전환만)", "원칙", "삭제 X", ""],
  ["언어 (i18n)", "EN/KO/JA/ZH/VI 자동", "운영", "사용자 locale 기반", ""],
  ["첨부 형식", "PDF + CSV 분리", "표준", "—", ""],
  ["다운로드 권한", "로그인 + RBAC", "표준", "Cross-tenant 차단", ""],
  ["Floating Deposit", "예약 시 자동 차감", "자동화", "잔액 관리 자동", "50% 소진 시 자동 알림 추가 검토"],
  ["적립 트리거", "체크아웃 시점 / 리뷰 즉시", "정책", "Earned-Checkout, Earned-Review", ""],
  ["ELS 회수", "영구 보존 (어떤 사유로도 X)", "원칙", "분쟁/리뷰 takedown 무관", ""],

  ["", "", "", "", ""],
  ["💡 POLICY_CHANGELOG 누적 30+건 (mocks/rewards.ts 영구 보존). Sheet 1 8건 결재 시 약 40건 도달.", "", "", "", ""],
];

const ws2 = xlsx.utils.aoa_to_sheet(sheet2);
ws2['!cols'] = [
  { wch: 18 }, { wch: 35 }, { wch: 40 }, { wch: 35 }, { wch: 45 },
];
xlsx.utils.book_append_sheet(wb, ws2, '보지 않아도 됨');

const outPath = 'C:/Users/LENOVO/Desktop/Dotbiz/docs/Settlement_CEO_DecisionList_with_Sage_2026-05-08_v2.xlsx';
xlsx.writeFile(wb, outPath);
console.log('Generated:', outPath);
