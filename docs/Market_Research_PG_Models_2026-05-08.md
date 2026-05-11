# B2B 호텔 공급사 PG/결제 모델 — 종합 마켓 리서치

**작성일**: 2026-05-08
**대상**: 대표이사, CFO, 기획팀
**목적**: TBO/Ratehawk 외 주요 공급사의 결제 모델 비교 → DOTBIZ 하이브리드 모델 설계 근거

---

## 🎯 리서치 범위

### Tier 1: Global Bedbank / Wholesale (대형 베드뱅크)
1. **Hotelbeds** (베드뱅크 1위, 매출 $7B+)
2. **WebBeds** (2위)
3. **Restel** (유럽 거점)
4. **Expedia TAAP** (Travel Agent Affiliate Program)
5. **Booking.com for Business**

### Tier 2: Aggregator / API Channel
6. **TBO Holidays** (이미 인지 - 인도 거점)
7. **Ratehawk** (이미 인지 - 러시아/CIS 거점)
8. **Hotelston** (동유럽)
9. **GIATA** (콘텐츠 + 분배)
10. **DerbySoft** (API 분배)
11. **Travelfusion**

### Tier 3: Asia 거점 B2B
12. **Agoda B2B** (Booking Holdings 산하)
13. **Trip.com Trade** (Ctrip B2B)
14. **DIDA Travel** (중국, DOTBIZ 직접 비교 대상)
15. **GTA / Kuoni** (현재 Hotelbeds 산하)
16. **Klook B2B**
17. **TraveloFlex**

### Tier 4: Niche / Specialized
18. **HotelPlanner B2B** (그룹 예약 특화)
19. **Tourico Holidays** (현재 Hotelbeds 산하)
20. **Hahnair** (항공·호텔 결합 결제)

---

## 📋 리서치 질문 프레임워크 (각 공급사별)

### A. 결제 모델 (Payment Model)

| 질문 | 답변 옵션 |
|------|----------|
| A-1. PG 수수료 부담 주체 | (a) 공급사 흡수 / (b) 고객사 직접 / (c) 호텔 가격 포함 / (d) 하이브리드 |
| A-2. 표시 가격 구조 | (a) 단일가 / (b) 정가 + 수수료 별도 / (c) 옵션별 가격 |
| A-3. PREPAY/POSTPAY 분기 | (a) PREPAY only / (b) POSTPAY only / (c) 양쪽 / (d) 계약별 |
| A-4. 결제 수단 | 송금 / 카드 / 디포짓 / 신용 한도 |
| A-5. 통화 처리 | 단일 USD / 다통화 / 계약 통화 |

### B. PG 전략

| 질문 | 답변 |
|------|------|
| B-1. PG 사 (Global vs Local) | |
| B-2. 평균 PG 수수료율 | |
| B-3. 국가별 PG 분리 여부 | |
| B-4. 카드 토큰화 / PCI-DSS | |

### C. 디포짓 / 신용 정책

| 질문 | 답변 |
|------|------|
| C-1. 디포짓 종류 | Credit / Floating / Guarantee / Insurance / Bank Guarantee / No Deposit |
| C-2. No Deposit 기준 | TTV 임계 / 거래기간 / 신용 점수 |
| C-3. AR Aging 정책 | 단계 / 트리거 / Write-off 기준 |
| C-4. 신용 한도 동결 | 단일 트리거 / 단계적 |

### D. 분쟁 / 환불

| 질문 | 답변 |
|------|------|
| D-1. 분쟁 처리 SLA | 우선순위별 |
| D-2. 자동 인정 한도 | 있음 / 없음 |
| D-3. Credit Note 정책 | 원본 수정 / 별도 발행 |
| D-4. 환불 처리 기간 | 영업일 X일 이내 |

### E. 인보이스 / 영수증

| 질문 | 답변 |
|------|------|
| E-1. Voucher 형식 | PDF / QR / 둘 다 |
| E-2. Invoice 보존 기간 | 법정 vs 자체 |
| E-3. 다국어 발송 | 자동 locale / 수동 선택 |
| E-4. 첨부 형식 | PDF / CSV / 둘 다 |

---

## 📊 공급사별 알려진 정보 (Public + Industry Insight)

### 1. Hotelbeds (베드뱅크 1위)

| 항목 | 정보 |
|------|------|
| **PG 모델** | **POSTPAY (계약 기반)** — 카드 사용 시 별도 처리 |
| 결제수수료 | 계약별 협상, 일반적으로 고객사 부담 |
| 통화 | 다통화 (EUR 기본) |
| 디포짓 | Credit by Company 위주 |
| AR Aging | 엄격 (Net-30 표준) |
| 분쟁 | 수동, 사례별 |
| Voucher | PDF, QR 미사용 |

→ **DOTBIZ 유사**: POSTPAY 중심, 계약 기반

### 2. WebBeds (베드뱅크 2위)

| 항목 | 정보 |
|------|------|
| PG 모델 | POSTPAY + PREPAY 양쪽 |
| 결제수수료 | 고객사 부담 (별도 청구) |
| 통화 | 다통화 |
| 디포짓 | Credit / Bank Guarantee |
| 특이점 | "Pay Later" 옵션 (TBO 유사) |

→ **TBO 패턴**: 결제수수료 고객 부담

### 3. Expedia TAAP

| 항목 | 정보 |
|------|------|
| PG 모델 | **Commission-based** (호텔에서 커미션 받음) |
| 결제수수료 | TAAP은 직접 결제 없음 — 호텔이 처리 |
| 통화 | USD 기본 |
| 디포짓 | 없음 (커미션 모델) |
| 특이점 | B2B2C — 여행사가 자기 마크업 |

→ **DOTBIZ와 다른 모델**: 커미션 기반

### 4. Booking.com for Business

| 항목 | 정보 |
|------|------|
| PG 모델 | **PREPAY (Booking.com 결제)** |
| 결제수수료 | 가격에 포함 (Ratehawk 유사) |
| 통화 | 다통화 |
| 디포짓 | 없음 (단건 결제) |

→ **Ratehawk 패턴**: 가격 포함

### 5. TBO Holidays

| 항목 | 정보 |
|------|------|
| **PG 모델** | **결제수수료 고객사 부담 (별도 청구)** |
| 결제수수료 | 카드 2.5~3.5% 별도 명시 |
| 통화 | 다통화, USD 기본 |
| 디포짓 | Credit by Company / Floating |
| AR Aging | Net-30 / Net-45 |
| 특이점 | B2B 전용, 고객사 직접 결제 옵션 |

→ **TBO 패턴 원조**: 투명 분리

### 6. Ratehawk (Emerging Travel Group)

| 항목 | 정보 |
|------|------|
| **PG 모델** | **호텔 가격에 결제수수료 포함 (단일 가격)** |
| 결제수수료 | 표시가에 흡수 |
| 통화 | 다통화 |
| 디포짓 | Credit by Company / Bank Guarantee |
| AR Aging | Net-30 |
| 특이점 | 가격 비교 시 불리하나 UX 깔끔 |

→ **Ratehawk 패턴 원조**: 단일 가격

### 7. Agoda B2B (Booking Holdings 산하)

| 항목 | 정보 |
|------|------|
| PG 모델 | PREPAY + POSTPAY 양쪽 |
| 결제수수료 | 가격 포함 (Ratehawk 유사) |
| 통화 | 다통화 (USD 기본) |
| 디포짓 | Credit |
| 특이점 | 아시아 강세, Booking.com 인프라 |

→ **Ratehawk 패턴**

### 8. Trip.com Trade (Ctrip B2B)

| 항목 | 정보 |
|------|------|
| PG 모델 | PREPAY 우선 + POSTPAY 협의 |
| 결제수수료 | 중국 시장: Alipay/WeChat 가격 포함 |
| 통화 | CNY/USD/다통화 |
| 디포짓 | Credit / Bank Guarantee |
| 특이점 | **중국 시장 PG: 1.0~2.0% (Alipay/WeChat 활용)** |

→ **Local PG 모델 사례**

### 9. DIDA Travel (DOTBIZ 직접 비교)

| 항목 | 정보 |
|------|------|
| PG 모델 | PREPAY (카드 직접) + POSTPAY |
| 결제수수료 | 명시 분리 (TBO 유사) |
| 통화 | 다통화 |
| 디포짓 | Credit by Company |
| 특이점 | **DOTBIZ Gap Analysis 대상** — 가격 정책 직접 경쟁 |

→ **TBO 패턴 + 직접 경쟁사**

### 10. GIATA / DerbySoft

| 항목 | 정보 |
|------|------|
| PG 모델 | **분배 채널 (직접 결제 없음)** |
| 결제수수료 | 호텔/공급사가 자체 처리 |
| 통화 | 미적용 |
| 특이점 | 콘텐츠 + API 분배 전문 |

→ **다른 카테고리** (인프라 제공)

---

## 📊 비교 매트릭스 (요약)

| 공급사 | PG 부담 | 표시가 | PREPAY/POSTPAY | Local PG | 시장 |
|--------|---------|--------|---------------|---------|------|
| **Hotelbeds** | 고객 부담 | 정가 | POSTPAY | 일부 | 글로벌 |
| **WebBeds** | 고객 부담 | 정가 + 수수료 | 양쪽 | 일부 | 글로벌 |
| Expedia TAAP | 호텔 처리 | — | 커미션 | — | 글로벌 |
| Booking.com Biz | 가격 포함 | 단일 | PREPAY | — | 글로벌 |
| **TBO** | **고객 부담** | **정가 + 수수료** | 양쪽 | ❌ | 글로벌 (인도) |
| **Ratehawk** | **가격 포함** | **단일** | 양쪽 | ❌ | 글로벌 (CIS) |
| **Agoda B2B** | 가격 포함 | 단일 | 양쪽 | ✅ (아시아) | 아시아 |
| **Trip.com Trade** | **Local PG 활용** | 다양 | 양쪽 | ✅ (중국) | 중국 |
| **DIDA** | 고객 부담 | 분리 | 양쪽 | 일부 | 중국 |
| GIATA/DerbySoft | 분배만 | — | — | — | 인프라 |
| **HotelPlanner** | 가격 포함 | 단일 | PREPAY | — | 그룹 특화 |
| **Hotelston** | 고객 부담 | 분리 | 양쪽 | 일부 | 동유럽 |

---

## 🎯 핵심 인사이트

### 패턴 분포

| 패턴 | 채택 공급사 |
|------|------------|
| **고객 부담 (TBO 방식)** | TBO, WebBeds, DIDA, Hotelston, Hotelbeds (일부) |
| **가격 포함 (Ratehawk 방식)** | Ratehawk, Booking.com Biz, Agoda B2B, HotelPlanner |
| **Local PG 활용** | Trip.com Trade, Agoda B2B (아시아) |
| **커미션 (호텔 처리)** | Expedia TAAP |

### 시장 분석

1. **글로벌 베드뱅크 (Hotelbeds, WebBeds)**: 고객 부담 + Credit 기반 POSTPAY 중심
2. **API 채널 (TBO, Ratehawk)**: 상반된 두 패턴 — 시장이 두 모델 모두 수용
3. **아시아 (Agoda, Trip.com)**: Local PG 활용 + 가격 포함 (UX 우선)
4. **중국 (Trip.com)**: Alipay/WeChat으로 PG 1~2% 달성 — DOTBIZ 벤치마크 가치 큼

### DOTBIZ 포지셔닝 시사점

| 영역 | 시사점 |
|------|------|
| **PG 모델** | 단일 모델보다 **하이브리드** 채택 (시장 검증) |
| **Local PG** | 아시아 거점 → **Trip.com처럼 Local PG 적극 활용** 필수 |
| **가격 표시** | 거래 유형별 분기 (Free Cancel=Ratehawk, POSTPAY=TBO) |
| **고객 인지** | 고객 부담 모델은 명시적 청구 → 투명성 어필 가능 |
| **차별화** | DIDA 직접 비교 시 가격 + UX 모두 우위 가능 |

---

## 📅 리서치 실행 계획 (2주)

### Week 1: Public Info 수집
- [ ] 각 공급사 공식 가격표 / 약관 다운로드
- [ ] 산업 보고서 검색 (PhocusWright, Skift 등)
- [ ] 경쟁사 OP 인터뷰 (이전 경험자 5명)

### Week 2: Direct Outreach
- [ ] 주요 공급사 (Hotelbeds, TBO, Ratehawk, Trip.com) 영업팀 컨택
- [ ] **샘플 견적 요청** — 동일 호텔 동일 조건으로 가격 비교
- [ ] 결제수수료 명시 방식 확인 (별도 청구 vs 가격 포함)
- [ ] 인보이스 샘플 입수 (5건 이상)

### 산출물

1. **PG 모델 종합 비교표** (15개 공급사 × 30개 항목)
2. **DOTBIZ 권장 하이브리드 모델 v2** (시장 검증 반영)
3. **Local PG 도입 ROI 계산** (한국/중국/일본/베트남/싱가포르)
4. **가격 시뮬레이션** — 동일 예약 5종 공급사 비교 (DOTBIZ 가격 위치)

---

## 💡 즉시 검증 가능한 가설

### 가설 1: Trip.com Trade의 Alipay/WeChat 활용 모델
- **검증**: Trip.com Trade 공식 사이트 / OP 인터뷰
- **목표**: 중국 시장 PG 1~2% 달성 모델 학습

### 가설 2: TBO의 결제수수료 명시 청구
- **검증**: TBO 인보이스 샘플 분석
- **목표**: "결제수수료 별도" 라인 UI/UX 패턴 학습

### 가설 3: Ratehawk의 호텔 마진 흡수 비율
- **검증**: 동일 호텔 Ratehawk vs Hotelbeds 가격 비교
- **목표**: 가격 차이 = Ratehawk의 PG 흡수 비율 추정

### 가설 4: Hotelbeds의 Local PG 활용 여부
- **검증**: Hotelbeds 한국/일본 거점 OP 인터뷰
- **목표**: 글로벌 베드뱅크도 Local PG 도입했는지 확인

---

## 📌 후속 결재 안건 (리서치 완료 후)

리서치 결과에 따라 다음 결재 가능:

1. **DOTBIZ 하이브리드 모델 v2 확정**
   - 거래 유형별 / 고객 규모별 / 국가별 매트릭스 완성

2. **Local PG 도입 우선순위**
   - 한국 (Toss/KCP) → 중국 (Alipay/WeChat) → 일본 (GMO) 순

3. **가격 포지셔닝 전략**
   - Hotelbeds 대비 / TBO 대비 / Ratehawk 대비 가격 위치

4. **고객사 안내 메시지**
   - "결제수수료는 가격에 포함" (Ratehawk) vs "별도 청구" (TBO) 명시 방식

---

## 📂 관련 문서

- `Settlement_CEO_Critical_Update_2026-05-08.md` (마진 재검토)
- `Settlement_CEO_Inspection_2026-05-07.md` (1단계 결재)
- `Settlement_CEO_Inspection_2026-05-08.md` (2단계 결재 Sage)
- `DIDA_Gap_Analysis_v2.0.md` (DIDA 비교)
- 본 문서: `Market_Research_PG_Models_2026-05-08.md`

---

**담당**: CFO + 기획 + 보안 (보안 인증 확인 부분)
**예산**: 외부 리포트 구매 비용 (PhocusWright 약 $5,000 / Skift Research 약 $3,000)
**완료 기한**: 2026-05-22 (2주)
