# DOTBIZ 1차 리뷰 — 데모 시연 가이드

> **리뷰일**: 2026년 4월 24일
> **데모 URL**: https://bstars00-rgb.github.io/Dotbiz/
> **소요 시간 목표**: 45분 (데모 30분 + Q&A 15분)
> **주 시연자**: 기획/개발팀

---

## 🎯 리뷰 메시지 (핵심 3문장)

1. **DOTBIZ는 이제 예약 시스템이 아니라, OP 로열티 경제를 가진 B2B 호텔 플랫폼입니다.**
2. **OP 개인에게 지급되는 ELS 코인과 OP가 쓴 리뷰가 자연스럽게 B2C로 흘러가는 플라이휠이 설계되었습니다.**
3. **모든 경제 파라미터는 승인 체인을 거쳐야 변경되며, 대표이사 결재 없이 돈이 움직이지 않습니다.**

---

## 📋 데모 순서 (30분)

### 🔖 Chapter 0 — 인트로 (2분)

**대본**: "지난 주 보고 이후 14개 커밋으로 크게 4개 블록을 추가했습니다. ELS 경제 시스템, 스탬프 업적, OP 리뷰 플라이휠, 그리고 거버넌스 레이어입니다. 실제 호텔 마진이 예약당 ₩3,500 수준이라는 현실을 반영해서 경제도 재설계했습니다."

**액션**: 로그인 화면 열기
```
Email:    master@dotbiz.com
Password: master123
```

---

### 🪙 Chapter 1 — ELS Wallet & 경제 시스템 (8분)

**Why this first**: 오늘 변경의 중심. 모든 다른 기능이 이 경제 시스템 위에 얹혀 있음.

**경로**: 사이드바 → **Rewards**

**시연 포인트**:

1️⃣ **Wallet 탭 — Hero 영역**
   - **ELS Balance 카드 (좌측)** 
     - "Your earn rate" 박스 → 1.2× Gold II + 티어 래더 시각화
     - "$1,000 booking → 12 ELS (+20% vs Bronze)" 실시간 계산
     - **"Unlock Gold: +10% more per booking, N bookings to go"** 랭크업 넛지
   - **Membership Rank 카드 (우측)**
     - LoL-style 엠블럼 (3-layer gradient + 회전 스탬프)
     - Roman numeral Division 배지 (I/II/III)
     - Global Rank #110 of 847 + Top 13% percentile
     - Rank Ladder (5개 티어 시각화, 현재 위치 glow)

2️⃣ **"What ELS does for you" 3-pillar 카드**
   - 🎁 Redeem → Shop
   - ⚡ +10/15/20% at promo hotels → Find Hotel
   - 🏆 Rank up + Stamps → Stamps 탭
   - **강조**: "personal, non-transferable" 원칙

3️⃣ **Active Promo Hotels 카드**
   - 6개 프로모 호텔 (Lotte Hanoi +20% flash 최상단)
   - 각 카드 "Book now · +15% ELS" 버튼만 클릭 가능
   - 클릭 → 호텔 상세 → 예약 플로우

4️⃣ **Wallet Activity (거래내역)**
   - Earned-Booking, Used-Redeem 항목 표시
   - **Export CSV** 버튼 시연 (1-2초로 다운로드)

5️⃣ **Shop 탭**
   - 3-20 ELS 범위 (30~40% 인하된 가격)
   - 🔥 Best Seller 배지 (5개 큐레이션)
   - 국가별 자동 필터링 (한국 OP는 한국 상품만)
   - Redeem 다이얼로그 → 쿠폰 코드 생성 → My Coupons 탭으로 자동 이동

**데모 대사**:
> "OP가 $1,000 예약을 Gold tier에서 Peninsula Shanghai(+15% promo)에 걸면 총 **13 ELS**를 받습니다. 이전 설계에선 이게 720 ELS였는데, 실물 마진 ₩3,500을 감안해 100배 축소했습니다. 이제 연간 2,000~3,000 ELS를 벌면 한 달치 월급 수준의 부수입이 됩니다."

---

### 🏆 Chapter 2 — Stamp Passport (5분)

**Why second**: ELS를 더 매력적으로 만드는 장기 engagement 시스템.

**경로**: Rewards → **Stamps 탭**

**시연 포인트**:

1️⃣ **Hero 카드 (빈티지 여권 디자인)**
   - 빈티지 크로스해치 종이 배경
   - 3/23 stamped · 13% complete progress bar (5색 그라디언트)
   - **희귀도 roll-up**: Common/Rare/Epic/Legendary/Mythic 각각 earned/total
   - **ELS from stamps**: +N earned / N locked

2️⃣ **카테고리별 섹션**
   - First-times (3), Milestones (6), Tiers (4), Explorer (4), Habits (6)
   - 각 카드에 **+N ELS 리워드 칩** (earned는 오렌지, locked는 회색)
   - Locked 스탬프: 진행률 바 + 🔒 + 명확한 조건 ("47 / 250 bookings · 18%")
   - Social proof: 👥 11% (global OPs earned this)

3️⃣ **희귀도 스펙트럼 시각**
   - Common (회색) → Rare (파랑) → Epic (보라) → Legendary (골드 glow) → **Mythic (무지개 다중 glow)**
   - Mythic 예: 🗿 Eternal (10-Year, 0.2% global) — **"fewer than 10 OPs ever"**

**데모 대사**:
> "스탬프는 정복감이 목표입니다. 희귀도별 +5 ~ +1,000 ELS 보너스가 지급되고, 전체 23개를 모두 모으면 평생 ~3,295 ELS. Mythic 스탬프는 의도적으로 5년 이상 걸리게 해서 장기 retention 레버로 작동합니다."

**특별 데모**: **로그아웃 → 재로그인 후 예약 완료 페이지**에서 스탬프 축하 팝업 시연 (데모 로테이션으로 매번 다른 스탬프 등장)

---

### 📝 Chapter 3 — OP Hotel Review 플라이휠 (7분)

**Why third**: DOTBIZ의 핵심 차별점 · B2B→B2C 네트워크 효과 · 사업 전략 레버.

**경로**: 사이드바 → Find Hotel → 아무 호텔 클릭 (예: Grand Hyatt Seoul)

**시연 포인트**:

1️⃣ **OP Reviews 탭 진입**
   - 탭 배지에 리뷰 수 표시 (예: `3`)

2️⃣ **Summary 카드**
   - ✓ OP-verified 배지 + "Professional OP Reviews" 설명
   - 평균 별점 + 총 리뷰 수 (큰 숫자)
   - **💡 Top 5 tips (cross-review aggregation)** — 여러 리뷰의 팁이 자동 집계
   - Write a review CTA + "최대 +12 ELS 보상"

3️⃣ **개별 리뷰 카드 시연**
   - 작성자 아바타 + 회사 + 국가 + "✓ Verified stay" 배지
   - 5-star rating 시각화
   - 본문 + 구조화된 OP Tips (파란 칩)
   - **📸 사진 갤러리** (rev-001 Grand Hyatt, rev-010 Mandarin, rev-030 Lotte)
     - 클릭 → 블랙 lightbox 확대
   - Helpful 투표 버튼 (본인 리뷰엔 비활성)

4️⃣ **인라인 Write Review 폼** (팝업 아님!)
   - "Write a review" 클릭 → 같은 페이지에서 펼쳐짐
   - 2-column 레이아웃:
     - 좌: 별점 선택 + 헤드라인 + 상세 본문
     - 우: 팁 (줄바꿈 구분) + 사진 4슬롯 + 실시간 리워드 프리뷰
   - **실시간 리워드 프리뷰**: 입력하면 "+3 base", "+2 quality", "+2 photo", "+5 first" 동적 표시
   - Submit 버튼 비활성 → 품질 게이트 충족 시 활성화

5️⃣ **B2C 신디케이션 안내 배너**
   - "These reviews reach end consumers" — DOTBIZ의 비즈니스 가설 UI로 명시

**데모 대사**:
> "OP 1,000명 × 평균 5 리뷰 = 5,000개의 프로페셔널 리뷰가 쌓입니다. 이게 B2C 발견 레이어로 신디케이션되면, DOTBIZ는 호텔 예약 엔진이 아니라 호텔 검색의 **신뢰 계층**이 됩니다. 리뷰당 최대 12 ELS 보상으로 양질 리뷰를 유인하되, 월 5개 캡 + 자동/수동 모더레이션으로 spam 차단합니다."

---

### 🚨 Chapter 4 — 예약 볼륨 이상치 알림 (3분)

**Why fourth**: 운영 안정성 · API 파트너 케어 · 고객 사고 조기 감지.

**경로**: 사이드바 → Notifications

**시연 포인트**:

1️⃣ **Booking 카테고리 필터**
   - 4개 신규 알림 표시:
     - 🟡 TravelCo UI Spike: "24 bookings today (3× normal)"
     - 🟡 GOTADI API Drop: "0 in last 24h (baseline 12/day)"
     - 🟡 Asia Tours UI Drop: "3 consecutive days, 0 bookings"
     - 🔴 VVC API Spike: "47 bookings in 1 hour"

2️⃣ **클릭 → 딥링크**
   - Booking Volume Drop → `/app/bookings?channel=api` 자동 필터
   - Spike → `/app/bookings?filter=1h`

**데모 대사**:
> "UI 직접 예약 업체뿐 아니라 API 연동 업체 (GOTADI, VVC)도 자사 예약을 확인할 수 있고, 갑자기 0건이거나 비정상적 spike가 발생하면 토큰 만료/네트워크 장애/스크립트 폭주를 조기 감지합니다. 고객사 입장에서도 안전망이고, OhMyHotel 입장에서도 수익 손실 방지 레버입니다."

---

### 🛡️ Chapter 5 — ELS Economics Admin & 거버넌스 (4분)

**Why last (highlight)**: 이것이 바로 대표이사 결재 프로세스의 실물. 다른 모든 기능의 상위 컨트롤.

**경로**: 사이드바 → Admin → **ELS Economics**

**시연 포인트**:

1️⃣ **헤더 KPI 4개**
   - **Pending Approvals: 3** (빨간색 강조)
   - Tunable Parameters: 17
   - Critical Items: 5
   - **Budget Cap: — (not yet set)** ← 빨간 강조, 결재 대기 플래그

2️⃣ **CEO 대기 알림 배너**
   - "3 requests awaiting CEO sign-off"

3️⃣ **Parameters 탭** (17개 카드)
   - 카테고리 필터 pill (Economics / Promotions / Shop / Gamification / Policy / Content)
   - 각 카드 요소:
     - Impact 배지 (Critical/High/Medium/Low)
     - 현재값 + 예산 힌트
     - **승인 체인 시각화** (CFO → CEO 등 아이콘 체인)
     - "Request Change" 버튼 → 다이얼로그 (제안값/사유/영향 분석)

4️⃣ **Requests 탭** — 실제 오늘 변경의 audit log
   - apr-001: CMO의 Earn rate +20% 상향 요청 **(CEO 대기 중)**
   - apr-010: 오늘 완료된 100× 축소 변경 (✅ CFO→CEO 체인 서명 완료)
   - apr-020: P2P 송금 요청 **❌ CEO 거절** + 이유 ("ELS stays tied to the OP who earned it")

5️⃣ **Approval Matrix 탭**
   - 17개 항목 Impact 순 정렬
   - 각 행: 카테고리 · 파라미터 · Impact · **체인** · 주기
   - Legend: Impact 색상 + 한국어 Approver 설명 (CEO=대표이사, CFO=재무이사 등)

**데모 대사**:
> "여기서 OP 리워드 경제의 어떤 것도 단독으로 바꿀 수 없습니다. 예산 영향이 클수록 결재 체인이 깊어지죠. 오늘 우리가 earn rate를 100배 줄인 것도 `apr-010`으로 기록되어 있고, 이 기록은 영구 보존됩니다. **대표님 결재가 필요한 첫 번째 큰 건은 월 예산 캡 설정입니다** — 현재 uncapped 상태라 Q2 OP 확대 전에 결정 필수입니다."

---

### 📰 Chapter 6 — OhMy Blog (짧게, 1분)

**경로**: 사이드바 → OhMy Blog

**시연 포인트**:
- 20개 아티클 (기존 4개 → 확장)
- 4개 카테고리 필터 pill 작동 (클릭하면 메인 레이아웃 바뀜)
- 하단 **All Articles 아카이브** + 검색

**데모 대사**:
> "리뷰 기사 라이브러리도 쌓았습니다. 주요 호텔 리뷰 + 도시별 가이드 (Seoul 스파 지도, Tokyo 라멘, Hanoi 스트릿푸드 등) 20건. 검색 가능 아카이브도 하단에 있습니다."

---

## 🎤 Q&A 대비 예상 질문 & 답변

### Q1. "OP한테 돈을 너무 많이 주는 것 아닌가?"
**A**: "실제 마진의 15~40% 범위로 조정했습니다. 일반 OP 월 54 ELS = ₩54,000 상당, GMV ₩4,500,000 대비 1.2%. 업계 벤치마크 Marriott Bonvoy B2B 1%, IHG 0.5%와 비슷한 수준입니다. **월 예산 캡이 설정되면 상한이 명확해집니다** — 오늘 결재 요청드립니다."

### Q2. "리뷰는 품질 보장 어떻게?"
**A**: "3단계 방어선:
1. 품질 게이트 (80자 + 1 팁 미만은 보상 0)
2. Approval 단계 (Pending → Approved 모더레이션)
3. 월 5개 리뷰 캡 + 1회/호텔 제한
OTA 업계(Booking, Expedia)와 동일한 표준이고, **B2C 신디케이션 때문에 우리는 더 엄격해야** 하므로 Content Manager 역할도 승인 매트릭스에 포함했습니다."

### Q3. "ELS 양도 안 되면 OP가 아쉬워하지 않을까?"
**A**: "두 가지 고려:
1. **개인 소유 → lock-in 강화**: OP가 자신만 받는 보상이라 DOTBIZ 이탈 시 손실 명확
2. **Gift-laundering 방지**: 팀 내 집중, AML/KYC 복잡도 증가 방지
CMO가 한 번 enable 요청했지만 (apr-020), CEO 거절 기록 보존했습니다. 요구가 재부상하면 재검토 가능한 구조입니다."

### Q4. "API 파트너가 리뷰 쓸 수 있나?"
**A**: "예. 데모 계정 `gotadi@dotbiz.com` (Nguyen Van An, GOTADI API 파트너)으로 로그인해도 Rewards + 리뷰 접근 가능합니다. 실제로 시드 데이터 중 rev-011, rev-030이 베트남 OP 리뷰입니다."

### Q5. "ELLIS admin은 실제로 언제 구현?"
**A**: "현재 DOTBIZ 프로토타입에 **preview**로 포함. 실제로는 별도 admin 앱 (Phase 2). 승인 워크플로우 로직과 데이터 모델은 오늘 모두 정의했으므로, ELLIS 앱 착수 시 그대로 이식 가능합니다."

### Q6. "Budget cap 제안액 ₩50M/월 근거?"
**A**: "현재 활성 OP 2,000명 × 월평균 50 ELS = ₩100M/월 추정. Q2 OP 확대(+30%)까지 수용하려면 ₩130M 필요. 캡을 ₩50M로 설정하면 강제 부족분 → OP 활동 둔화 유발 → earn rate 재조정 신호가 자연스럽게 발생. 대안:
- **보수적**: ₩50M
- **현상유지**: ₩120M
- **성장용**: ₩150M
대표님께서 결정 주시면 그에 맞춰 earn rate 1차 추가 조정 함께 하겠습니다."

---

## 🚦 시연 중 주의사항

- **로컬스토리지 캐시**: 이전 로그인 정보 (Kevin Lee 등)가 남아 있을 수 있음 — 시연 전 **로그아웃 후 재로그인** 권장
- **스탬프 팝업**: Booking Complete 후 첫 시연 시 welcoming modal이 등장 — 예상된 동작
- **Active Promo 카드 클릭**: **버튼만** 클릭되게 했음 — 카드 전체 클릭해도 반응 없음을 언급
- **이전 버전 캐시**: gh-pages CDN 지연 있을 수 있으니 **Ctrl+Shift+R 하드 리프레시** 안내
- **모바일 반응형**: 데모는 데스크톱에서. 모바일 별도 언급 필요 시 짧게

---

## 📊 핵심 수치 (한눈에)

| 지표 | 값 | 증감 (v1 대비) |
|-----|-----|--------------|
| 페이지 | 28개 | +2 |
| Mock 파일 | 22개 | +8 |
| 테스트 | **91/91 passing** | +6 |
| 오늘 커밋 | 14개 | — |
| 기획 점수 | **94/100 (A)** | +5 |
| QA 점수 | **91/100 (A-)** | +3 |

**데모 URL**: https://bstars00-rgb.github.io/Dotbiz/
**1차 리뷰 일시**: 2026-04-24
**예상 소요**: 30분 데모 + 15분 Q&A

---

**Good luck! 🎯**
