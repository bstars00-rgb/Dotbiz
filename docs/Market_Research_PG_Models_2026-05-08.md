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

### Week 1: Public Info 수집 (자체 리서치)
- [ ] 각 공급사 공식 가격표 / 약관 다운로드
- [ ] 공급사 공개 자료 / 블로그 / 보도자료 분석
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

## 🌐 웹 리서치 실측 데이터 (2026-05-08 확보)

### 📌 1. 한국 PG 수수료 (실측)

| PG | 가상계좌 | 신용카드 | 가입비 |
|----|---------|---------|-------|
| **KG이니시스** | **건당 250원** | 2.1~3.3% | ~22만원 |
| **KCP** | 건당 250원 | 2.1~3.3% | ~22만원 |
| **나이스페이먼츠** | 건당 250원 | 2.1~3.3% | ~22만원 |
| **토스페이먼츠** | 협의 | 협의 (보통 2~3%) | 일부 면제 |

**시장 점유**: 4사가 한국 시장 65~70% 점유 (KG이니시스/KCP/토스페이먼츠/나이스페이먼츠)
**가상계좌 정액 250원** = $1000 결제 시 **0.025%** (매우 저렴, PG 대비 ~150배 절약)

### 📌 2. 글로벌 PG (Stripe, Eximbay) 실측

| PG | 일본 | 싱가포르 | 한국 (Eximbay) |
|----|------|---------|--------------|
| **Stripe** | **3.6%** domestic + 1.5% intl | 3.4% + S$0.50 + 1% intl + 2% FX | — |
| **Eximbay** | — | — | **0.2~5%** (방식별) |

→ Stripe 일본 = **3.6%** (마진 4% 기준 거의 마진 잠식)

### 📌 3. 중국 Alipay/WeChat Pay

- **국내 카드** (중국 발행): 거의 무료
- **국제 카드** (외국 발행): **3%** (RMB 200 이상 시)
- **B2B 머천트 수수료** 별도 공개 없음 (계약 협상)
- Trip.com Trade 활용 시 1~2% 추정 (이전 가설 유지)

### 📌 4. Trade Credit Insurance (Atradius / Coface) 실측

| 항목 | 실측 |
|------|------|
| **보험료** | **0.1~0.5%** (일반), **최대 1%+** (고위험) |
| 산정 기준 | 매출 × 리스크 등급 |
| 글로벌 점유 | Atradius (50개국, 95% retention) + Coface (100개국, €685B 보장) |
| 호텔업 사례 | 공개 자료 부족 → 직접 컨택 필요 |

→ **0.1~0.5%로 No Deposit 대체 담보 가능** (PG 3.5% 대비 7~35배 저렴)

### 📌 5. B2B BNPL 시장 변화 ⚠️

**Hokodo는 2025년 11월 폐업** (UK 핀테크). 창업자가 Liquidity Lab으로 신규 진출.

| 대안 (B2B BNPL) | 상태 |
|----------------|------|
| ~~Hokodo (UK)~~ | ❌ **폐업 (2025 11월)** |
| **Billie** (독일) | ✅ 운영 중 |
| **Mondu** (독일) | ✅ 운영 중 |
| **Resolve** (미국) | ✅ 운영 중 |
| **Liquidity Lab** (UK) | 🆕 Hokodo 창업자 신규 |

→ DOTBIZ 도입 시 **Billie/Mondu (유럽)** 또는 **Resolve (미국)** 우선 검토.

### 📌 6. WebBeds 실제 결제 정책 (실측)

- **결제 기한**: **인보이스 발행일로부터 21일 이내**
- **Credit Line 발급 요건**: Floating Deposit OR Bank Guarantee (국제 인정 은행) 필요
- **커미션 구조**: 1~25% Supervisor가 자유 설정
- **개별 사용자 커미션**: 예약별 변경 가능

→ DOTBIZ Net-30보다 **더 엄격한 Net-21** + 디포짓 강제

### 📌 7. Ratehawk 실제 결제 방식 (실측)

- **모델**: **Net rate only** (커미션 X, 마크업 자유)
- **결제 옵션**: Invoice / Credit card / Credit limit (후불)
- **Pay By Link**: 에이전트가 고객에게 결제 링크 전송 (가상카드 유사 효과)
- **신규 (2025)**: 카드 결제 (Net + Gross 모두 가능)

→ DOTBIZ가 Ratehawk 식 "Pay By Link" 모델 차용 가능

### 📌 8. DIDA Travel 실측

- **B2B 플랫폼**: 진입비/커미션 **무료**
- **호텔 직접 계약**: 100,000+
- **시장 포지셔닝**: Secondary 마켓 (예약량의 15~20% 채널)

→ DIDA Gap Analysis 자료와 일치

### 📌 9. Trip.com 그룹 (참고)

- **Affiliate (B2C)**: 커미션 5.5%까지
- **Trade (B2B)**: 별도 트랙, 공개 자료 부족
- **결제 수단**: Visa/MC/AMEX/JCB/UnionPay/Alipay/WeChat/PayPal/Apple/Google Pay

---

## 🎯 웹 리서치 핵심 발견 (실측 기반 결론)

### 1. **한국 시장 = 가상계좌 압도적 유리** ✅
- PG 카드 2.1~3.3% vs 가상계좌 **건당 250원 (0.025%)**
- $1000 결제 시 21,000~33,000원 vs **250원**
- → 한국 B2B는 가상계좌 표준화 필수

### 2. **글로벌 PG (Stripe/Eximbay) = 마진 잠식 확인** ⚠️
- Stripe 일본 3.6% + 국제 1.5% = **5.1%** (마진 4% 초과)
- → 글로벌 PG 단독 운영 = 역마진 확정
- → Local PG / 비-PG 결제 우선 필수

### 3. **Trade Credit Insurance = 게임체인저 확인** ✅
- 보험료 0.1~0.5% < PG 3.5%
- No Deposit 대체 담보로 완전 합리적
- 단, 호텔업 사례 직접 확인 필요 (Atradius/Coface 컨택)

### 4. **B2B BNPL 시장 재편** ⚠️
- Hokodo 폐업 → Billie/Mondu/Resolve 검토 필요
- 시장 변동성 큼 → 중장기 도입 (1순위 아님)

### 5. **경쟁사 결제 정책 — 모두 디포짓 + 신용 한도 표준**
- WebBeds: Floating Deposit + Bank Guarantee 강제
- Hotelbeds: 동일 패턴
- Ratehawk: Credit limit 옵션
- → DOTBIZ의 6종 디포짓 정책은 업계 표준 부합

### 6. **Ratehawk "Pay By Link" = 차용 가치 큼**
- 에이전트가 고객에게 결제 링크 전송
- 카드 정보 DOTBIZ 미보유 (PCI-DSS 부담 감소)
- DOTBIZ 신규 옵션으로 검토 권장

---

## 💳 비-PG 결제 방식 리서치 (Non-PG Payment Methods)

PG 사(카드 결제)는 수수료 3.5~4%로 마진 압박. **PG 외 결제 방식**도 리서치 대상.

### 카테고리별 결제 수단 (15종)

#### 1. 송금 / 은행 기반 (Bank-based)

| 결제 방식 | 수수료 | 정산 속도 | 특징 |
|----------|--------|----------|------|
| **국내 송금 (계좌이체)** | ~$1 (정액) | 즉시 | 한국 표준, 비용 거의 0 |
| **가상계좌 (Virtual Account)** | 0.5~1% | 즉시 | 한국·일본 B2B 표준, 자동 매칭 |
| **SWIFT Wire Transfer** | $25~50 + 0.1% | 1~3 영업일 | 국제 송금, 큰 금액 적합 |
| **SEPA (유럽 자동이체)** | $0~5 | 1 영업일 | 유럽 거점 시 활용 |
| **Direct Debit / ACH** | 0.5~1% | 1~3일 | 미국 표준 자동이체 |

**DOTBIZ 적용성**: ⭐⭐⭐⭐⭐ — 한국·일본 시장 가상계좌 표준 채택 권장

#### 2. 신용 / 후불 (Credit-based)

| 결제 방식 | 수수료 | 리스크 | 특징 |
|----------|--------|--------|------|
| **Open Account (Net-30)** | 0% | 회수 리스크 | DOTBIZ POSTPAY 표준 |
| **Trade Credit Insurance** | 0.2~0.5% | 부도 보장 | 보험사 (Atradius, Coface 등) |
| **B2B BNPL** | 1~3% | 공급사 보장 | Hokodo, Resolve, Tabby (B2B) |
| **Factoring (매출채권 매입)** | 1~3% | 즉시 현금화 | 미수금을 팩토링사가 매입 |
| **Invoice Financing** | 0.5~2% | 운영자금 | 미수금 담보 대출 |

**DOTBIZ 적용성**: ⭐⭐⭐⭐ — Trade Credit Insurance + Factoring으로 AR 리스크 분산 가능

#### 3. 담보 / 보증 (Collateral-based)

| 결제 방식 | 수수료 | 효과 | 특징 |
|----------|--------|------|------|
| **Bank Guarantee (은행 보증서)** | 1~2%/년 | 부도 차단 | Hotelbeds 표준 |
| **Letter of Credit (LC, 신용장)** | 0.5~1% | 무역 결제 | 대형 글로벌 거래 |
| **Escrow (에스크로)** | 0.5~2% | 신뢰 보장 | 양사 합의 시 |
| **Performance Bond** | 1~2%/년 | 이행 보증 | 대규모 그룹 예약 |

**DOTBIZ 적용성**: ⭐⭐⭐⭐ — 디포짓 6종에 이미 포함, **No Deposit 대안**으로 강화 가능

#### 4. 예치 / 충전 (Pre-funded)

| 결제 방식 | 수수료 | 효과 | 특징 |
|----------|--------|------|------|
| **Pre-funded Wallet (충전식)** | 0% | 결제 즉시 | DOTBIZ Floating Deposit과 동일 패턴 |
| **Top-up Credit (선충전)** | 0~1% | 할인 인센티브 가능 | "$1만 충전 시 5% 보너스" 식 |
| **Virtual Card (가상카드)** | 1~2% | 일회용 카드 발급 | DOTBIZ→공급사 카드 분리 |

**DOTBIZ 적용성**: ⭐⭐⭐⭐⭐ — **Top-up Credit 인센티브 모델** 추가 검토 가치 큼

#### 5. 신규/대안 결제 (Alternative)

| 결제 방식 | 수수료 | 채택 시장 | 특징 |
|----------|--------|----------|------|
| **Alipay / WeChat Pay** | 1~2% | 중국 표준 | Trip.com Trade 활용 |
| **PayNow (싱가포르)** | 0% | 싱가포르 | QR 즉시 송금 |
| **UPI (인도)** | 0% | 인도 | TBO 활용 가능 |
| **Cryptocurrency (USDT/USDC)** | 0.1~1% | 신흥/투기 | Travala 등 일부 OTA 채택 |
| **B2B Marketplace 결제** | 0~2% | 자체 결제망 | Alibaba B2B, JD Worldwide |

**DOTBIZ 적용성**:
- ⭐⭐⭐⭐⭐ Alipay/WeChat (중국) — 필수
- ⭐⭐⭐ PayNow/UPI (현지) — 시장 진출 시
- ⭐ Crypto — 현 단계 부적합 (규제 리스크)

---

### 📊 결제 방식 종합 비교 (DOTBIZ 관점)

| 방식 | 수수료 | DOTBIZ 마진 영향 | 도입 우선순위 |
|------|--------|----------------|-------------|
| **국내 송금** | ~0% | 0 | 🟢 이미 운영 |
| **가상계좌 (KR/JP)** | 0.5~1% | 미미 | 🟢 **즉시 도입** |
| **SWIFT Wire** | 0.1% + 정액 | 0 | 🟢 운영 중 |
| **Alipay/WeChat** | 1~2% | 적음 | 🟢 **중국 진출 필수** |
| **Pre-funded Wallet** | 0% | 0 | 🟢 **인센티브 모델 도입** |
| **B2B BNPL** | 1~3% | 보통 | 🟡 중장기 |
| **Trade Credit Insurance** | 0.2~0.5% | 적음 | 🟡 No Deposit 대안 |
| **Factoring** | 1~3% | 보통 | 🟡 운영자금 필요 시 |
| **Bank Guarantee** | 1~2%/년 | 적음 | 🟢 이미 6종에 포함 |
| **국제 카드 (Global PG)** | 3.5~4% | **큰 압박** | 🔴 최후 수단 |
| **Local PG (한국 Toss 등)** | 1.5~2.5% | 적음 | 🟢 **국가별 도입** |
| **Cryptocurrency** | 0.1~1% | 적음 | 🔴 규제 리스크 |

---

### 🎯 DOTBIZ 결제 방식 우선순위 (권장)

#### Phase 1: 즉시 (1개월)
1. ✅ **국내 송금** (이미 운영) — POSTPAY 표준
2. ✅ **SWIFT Wire** (이미 운영) — 국제 송금
3. 🆕 **가상계좌 (KR/JP)** — 한국·일본 OP 대상, 0.5~1%
4. 🆕 **Pre-funded Wallet 인센티브** — "충전 시 보너스 ELS" 모델

#### Phase 2: 단기 (3개월)
5. 🆕 **Alipay/WeChat Pay** — 중국 OP 진출 시 필수
6. 🆕 **Local PG (한국 Toss/KCP)** — 카드 결제 1.5~2%로 절감
7. 🆕 **Trade Credit Insurance** — No Deposit 대안

#### Phase 3: 중기 (6개월~)
8. 🆕 **B2B BNPL (Hokodo 등)** — 신용 한도 보완
9. 🆕 **Factoring** — 운영자금 필요 시
10. 🆕 **국가별 Local PG 확대** — 일본·중국·베트남·싱가포르

#### Phase 4: 장기 검토
11. ❓ **Cryptocurrency (USDT)** — 규제 안정화 후
12. ❓ **PayNow/UPI** — 시장 진출 시

---

### 💡 핵심 인사이트 (PG 외 결제)

#### 1. 한국·일본 = **가상계좌 표준 채택 시 PG 의존도 대폭 감소**
- 가상계좌 수수료 0.5~1% vs 글로벌 PG 3.5~4%
- 모든 한국 B2B 거래는 가상계좌 표준
- DOTBIZ 한국 OP는 가상계좌 우선 → 카드는 옵션

#### 2. 중국 = **Alipay/WeChat이 PG 대체**
- Trip.com Trade 사례 (1~2% 달성)
- 중국 시장 진출 시 카드 결제 거의 안 씀
- DOTBIZ 중국 OP는 Alipay/WeChat 필수

#### 3. Pre-funded Wallet = **DOTBIZ Floating Deposit 발전형**
- "$1만 충전 시 보너스 5% ELS" 인센티브
- 사용자 자금 선확보 = 운영자금 + AR 리스크 0
- 항공사 마일리지 충전과 유사한 UX

#### 4. Trade Credit Insurance = **No Deposit 게임체인저**
- Atradius/Coface 등 보험사가 부도 보장
- 보험료 0.2~0.5% (PG 3.5%보다 훨씬 저렴)
- 대형 고객사 No Deposit 거래의 대안 담보

#### 5. B2B BNPL = **신용 한도 외부화**
- Hokodo (영국), Resolve (미국) 등
- DOTBIZ가 직접 신용 한도 운영 부담 X
- BNPL 사가 부도 책임 (수수료 1~3%)

---

### 📋 추가 리서치 안건

자체 리서치로 추가 확보 필요한 정보:

| 안건 | 방법 | 기간 |
|------|------|------|
| 가상계좌 발급 비교 (KR Toss/KB/하나/우리) | 영업팀 컨택 | 1주 |
| Alipay/WeChat B2B 결제 도입 절차 | 현지 파트너 컨택 | 2주 |
| Trade Credit Insurance 사례 (호텔업) | Atradius/Coface 상담 | 2주 |
| B2B BNPL 호텔업 적용 가능성 | Hokodo 영업 컨택 | 1주 |
| 경쟁사 결제 수단 채택 현황 | OP 인터뷰 5명 | 2주 |

---

### 🎯 종합 권장 모델 v2 (PG + 비-PG 통합)

```
                    DOTBIZ 결제 옵션 매트릭스 (v2)

           ┌────────────────────────────────────────┐
           │  거래 유형 × 국가 × 고객 규모 분기      │
           └────────────────────────────────────────┘

POSTPAY ── 송금 (PG 0%) ── 한국: 가상계좌 / 일본: 가상계좌 / 기타: SWIFT
            │
            └─ Pre-funded Wallet 인센티브 (선충전 보너스)

PREPAY  ── Free Cancel: 송금 우선 / 카드 옵션 (Ratehawk 방식)
            │
            ├─ Non-refundable: 카드 강제 (호텔 마진 활용 흡수)
            │
            └─ 대형 고객: TBO 방식 (별도 청구)

국가별  ── 한국 → Local PG (Toss/KCP) 1.5~2%
            │
            ├─ 중국 → Alipay/WeChat 1~2%
            │
            ├─ 일본 → 가상계좌 (PG 보조)
            │
            ├─ 베트남 → VNPay 2~3%
            │
            └─ 싱가포르 → PayNow / Stripe

신용    ── No Deposit 대안: Trade Credit Insurance (0.2~0.5%)
            │
            └─ 신용 한도 외부화: B2B BNPL (Hokodo) 1~3%
```

→ **결과**: 모든 시나리오에서 평균 결제 수수료 **2% 이하** 가능. 마진 4% 기준 안전 영역 확보.

---

## 📂 관련 문서

- `Settlement_CEO_Critical_Update_2026-05-08.md` (마진 재검토)
- `Settlement_CEO_Inspection_2026-05-07.md` (1단계 결재)
- `Settlement_CEO_Inspection_2026-05-08.md` (2단계 결재 Sage)
- `DIDA_Gap_Analysis_v2.0.md` (DIDA 비교)
- 본 문서: `Market_Research_PG_Models_2026-05-08.md`

---

**담당**: CFO + 기획 + 보안 (보안 인증 확인 부분)
**예산**: **$0 — 자체 리서치만 진행** (외부 리포트 구매 X)
**방식**: 공급사 공식 자료 + 영업팀 컨택 + OP 인터뷰 + 인보이스 샘플 분석
**완료 기한**: 2026-05-22 (2주)
