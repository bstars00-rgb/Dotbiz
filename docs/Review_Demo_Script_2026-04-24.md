# DOTBIZ 1차 리뷰 — 전체 데모 시연 가이드

> **리뷰일**: 2026년 4월 24일
> **데모 URL**: https://bstars00-rgb.github.io/Dotbiz/
> **소요 시간 목표**: 60분 (전체 데모 45분 + Q&A 15분)
> **주 시연자**: 기획/개발팀

---

## 🎯 리뷰 메시지 (핵심 3문장)

1. **DOTBIZ는 DIDA B2B 포털을 자사 기술로 재구축한 OhMyHotel의 B2B 호텔 예약 플랫폼입니다. 28개 페이지, 91/91 테스트 통과.**
2. **단순 예약 시스템이 아니라, ELS 코인 기반 OP 로열티 경제 + OP 리뷰 B2C 플라이휠까지 내장된 완성형입니다.**
3. **모든 경제 파라미터는 승인 체인을 거쳐야 변경되며, 대표이사 결재 없이 돈이 움직이지 않습니다.**

---

## 📋 전체 데모 시연 순서 (45분)

| Chapter | 기능 블록 | 시간 | 신규? |
|---------|---------|-----|------|
| 0 | 인트로 + 로그인 | 2분 | — |
| 1 | Dashboard (운영 현황 대시보드) | 3분 | — |
| 2 | Find Hotel → Search → Hotel Detail | 5분 | ⭐ 일부 신규 (OP Reviews 탭, ⚡ 프로모 배지) |
| 3 | Booking Flow (Form → Confirm → Complete) | 4분 | ⭐ 신규 (스탬프 축하 팝업) |
| 4 | Bookings 관리 + Tickets | 3분 | — |
| 5 | Settlement (정산 / 인보이스 / 디포짓) | 5분 | — |
| 6 | **Rewards Mall — ELS Wallet** | 6분 | ⭐⭐ 오늘 중심 |
| 7 | **Stamp Passport** | 3분 | ⭐⭐ 신규 |
| 8 | **OP Hotel Reviews 플라이휠** | 4분 | ⭐⭐ 핵심 신규 |
| 9 | Master Account (Sub-accounts / Cards / Voucher) | 3분 | — |
| 10 | My Account + Notifications (+ Anomaly Alerts) | 2분 | ⭐ 신규 (볼륨 이상치) |
| 11 | **ELS Economics Admin + 거버넌스** | 4분 | ⭐⭐ 신규 |
| 12 | OhMy Blog + FAQ (Knowledge Base) | 2분 | ⭐ Blog 확장 |
| 13 | Map Search + Favorites + Monthly Rates | 1분 | — (참고용) |

**Q&A** (15분) — 하단 예상 질문 답변 스크립트 참조

---

## Chapter 0 — 인트로 + 로그인 (2분)

**대본**: "DOTBIZ는 지난 3개월 동안 DIDA B2B 포털을 벤치마킹해 자사 플랫폼으로 전환한 프로젝트입니다. 28개 페이지, 91/91 테스트 통과, 오늘 대대적인 **ELS 경제 시스템 도입**으로 단순 예약툴을 넘어선 **OP 로열티 생태계 플랫폼**이 되었습니다."

**액션**:
1. https://bstars00-rgb.github.io/Dotbiz/ 접속
2. 데모 계정 로그인 → **`master@dotbiz.com` / `master123`** (James Park, TravelCo Master)

---

## Chapter 1 — Dashboard (3분)

**경로**: 로그인 후 자동 진입 `/app/dashboard`

**시연 포인트**:
1. **Quick Stats 카드** — 활성 예약, 이달 GMV, Credit 잔고, 미수금 등
2. **최근 예약 테이블** — 바로 가기
3. **Credit 상태 카드** (POSTPAY) 또는 **디포짓 상태** (PREPAY)
4. **인보이스 요약** (이달 발행/미납 counts)
5. **빠른 링크**: 새 예약 · 미처리 티켓 · 이번 달 정산

**대본**:
> "POSTPAY 고객사의 Master 로그인 화면입니다. 운영 상태가 한눈에 보이도록 좌측에 실적, 중앙에 Credit 상태, 우측에 인보이스 요약을 배치했습니다. 각 위젯 클릭 시 해당 영역 상세로 이동합니다."

---

## Chapter 2 — Find Hotel / Search Results / Hotel Detail (5분)

### 2.1 Find Hotel
**경로**: 사이드바 → **Find Hotel**

- 도시 자동완성 + 최근 검색
- 체크인/체크아웃 DateRangePicker
- 게스트 수 + 객실 수 선택
- **Search Hotel** 버튼

### 2.2 Search Results
- 7개 필터 (별점, 가격대, 편의시설, 브랜드, 정책, Free Cancellation, Multiple Points)
- **⚡ 프로모 배지**: "+10% ELS" / "+15% ELS" / "+20% ELS" 펄싱 그라디언트 (6개 호텔에 활성)
- 정렬 (추천 / 가격 / 리뷰 / 별점)
- 지도 뷰 토글 (List / Map)
- 카드 클릭 → 호텔 상세

### 2.3 Hotel Detail ⭐ (신규 기능 포함)
**4개 탭**:
1. **Rooms** — rowspan 테이블 (같은 룸 타입 여러 rate plans), Reserve now 바로가기, Sold Out 처리
2. **Overview** — AI-Enhanced 설명 + **📋 Copy 버튼** ⭐ (신규 — OP가 고객 이메일에 붙여넣기 편함)
3. **Policies** — Check-in/out, 취소, 아동, 반려동물, 흡연 + **📋 Copy 버튼** ⭐
4. **Facilities** — 30개 시설 + **📋 Copy 버튼** ⭐
5. **OP Reviews** ⭐⭐ (오늘 신규 탭, 상세는 Ch8에서)

**대본**:
> "호텔 상세는 DIDA의 rowspan 테이블 구조를 그대로 유지하면서, Overview/Policies/Facilities 3개 탭에 **Copy 버튼**을 추가했습니다. OP가 매일 반복해서 고객 컨펌 메일에 붙여넣는 정보를 원클릭으로 정리된 텍스트로 복사합니다. 오늘의 핵심 추가 — **OP Reviews 탭**은 뒤에서 자세히 보여드리겠습니다."

---

## Chapter 3 — Booking Flow (4분)

### 3.1 Booking Form
**경로**: Hotel Detail → Reserve now

- **Booker 정보** (이메일 자동완성)
- **Travelers** (성별/여권이름/로컬이름, Room 그룹 매칭)
- **Special Requests** (체크박스 + 자유 입력 + 예상 check-in 시간)
- **⭐ Expected ELS 카드** (신규): 실시간 예상 적립 미리보기
  - "You'll earn +N ELS (1 ELS/$100 · 1.2× Gold · +15% hotel promo)"
- **Billing Rate**: POSTPAY vs PREPAY 분기
- PREPAY + Non-refundable → **Pay & Book** 버튼 (PG 결제 다이얼로그)
- POSTPAY → **Create** 버튼

### 3.2 Booking Confirm
- Booker / Booking Detail / Travelers / Special Request 전 내역 확인
- 정산 타입별 안내 (POSTPAY: "next billing cycle" / PREPAY: 결제 완료 안내)
- **취소/수정 정책 안내**: "Bookings cannot be modified. Cancel and rebook." (DOTBIZ 정책)
- Terms 동의 체크 → **Confirm Booking**

### 3.3 Booking Complete ⭐ (신규: 스탬프 축하 팝업)
- 🎉 Confirmed! + ELLIS Code (예: `ELS-2026-12345`)
- Booking Details + Total
- 다운로드 바우처 / 이메일 전송 / My Bookings / New Booking 버튼
- **⭐ 스탬프 축하 팝업** (신규): 예약 완료마다 데모 스탬프 로테이션에서 하나 등장
  - Common → Rare → Epic → Legendary → **Mythic** 순서로 희귀도 에스컬레이션
  - 팝업: 스탬프 엠블럼 + 보너스 ELS + Journey summary + "View Passport" CTA

**대본**:
> "예약 플로우는 DIDA의 3단계 (Guest Info → Review → Complete) 구조를 유지합니다. 오늘 추가된 두 가지: **Expected ELS 카드**로 얼마 적립되는지 예약 전 확인 가능, 그리고 **스탬프 축하 팝업**이 예약 완료마다 등장해 게임처럼 몰입되게 만들었습니다."

---

## Chapter 4 — Bookings 관리 + Tickets (3분)

### 4.1 Bookings (`/app/bookings`)
- 30건 시드 예약 (다양한 status: Confirmed, Pending, Cancelled)
- 필터: Status, 기간, 호텔, Room type
- 검색
- 예약 상세: 바우처 다운로드, **✕ 수정 불가** (DOTBIZ 정책), 취소 가능 조건 분기 (Free cancel vs Non-refundable vs 데드라인 경과)
- **Request Change 버튼** → 티켓 생성 페이지로 (수정 대신 티켓만)

### 4.2 Tickets (`/app/tickets`)
- 문의/요청 티켓 관리
- Status 필터 (Open / In Progress / Resolved / Closed)
- Priority + Category 분류
- 새 티켓 생성 다이얼로그 (첨부파일 지원)

**대본**:
> "DOTBIZ는 예약 **수정을 허용하지 않습니다**. 취소 후 재예약만 가능하고, 요청사항 변경은 티켓으로 받습니다. Non-refundable은 취소도 불가. 정책을 깔끔히 유지해서 분쟁 여지를 줄였습니다."

---

## Chapter 5 — Settlement (5분)

**경로**: 사이드바 → **Settlement** (Master 전용)

### 5.1 탭 구조 (POSTPAY 기준)
1. **Credit Line** — Credit 잔고 + Deferred 잔고 + 디포짓 통합 카드
2. **Invoices** — 34건 인보이스, aging 4-bucket (Current / 30d / 60d / 90d+)
3. **Billing Lines** — 42건 라인아이템 (예약별 rate + 수수료)
4. **Top-ups** — 디포짓 충전 이력 + 은행 송금 가이드
5. **Activity Log** — 모든 정산 이벤트 감사 로그

### 5.2 주요 기능 시연
- **Invoice Detail 페이지**: PDF export, 이메일 전송 다이얼로그 (감사 로그 포함)
- **Aging 카드**: 인보이스별 연체 bucket 시각화 (DIDA 스타일)
- **Credit Line 카드**: Deposit + Credit 통합 표시, Limit 시각화
- **Top-up Wire Instructions**: "Copy" 버튼으로 회계팀 메신저 전달 즉시
- **멀티엔티티**: GOTADI 계정으로 전환하면 SG + VN 2개 계약 분리 표시

**대본**:
> "정산 영역은 가장 많은 개편을 거친 부분입니다. POSTPAY는 Net-5 기본, PREPAY는 전액 송금 (partial 금지). Aging 버킷은 인보이스 레벨로 정리, Credit Line 카드는 Deposit + Credit 합쳐 불필요한 혼동을 없앴습니다. 인보이스 PDF는 멀티엔티티 계약별로 별도 렌더됩니다."

---

## Chapter 6 — Rewards Mall: ELS Wallet ⭐⭐ (6분, 오늘 중심)

**경로**: 사이드바 → **Rewards**

### 6.1 Wallet 탭 (기본)

**Hero 영역**:
- **ELS Balance 카드 (좌측 2/5)**
  - 185 ELS · ≈ US$185 · 1 ELS = 1 USD
  - **Earn rate 박스** — 1.2× Gold II + 티어 래더 (Bronze 1.0× → Diamond 1.5×)
  - "$1,000 booking → 12 ELS (+20% vs Bronze)"
  - **💡 "Unlock Platinum: +8% more per booking, N bookings to go"** 넛지

- **Membership Rank 카드 (우측 3/5)**
  - **LoL-style 3-layer 엠블럼** (메탈 링 + gemstone medallion + Division 배지)
  - Roman numeral (I/II/III) 하단 배지
  - **Global Rank #110 of 847 + Top 13% percentile + 1.2× Earn**
  - 5-tier 래더 시각화 (현재 위치 glow)
  - Tier Perks 칩 (Gold: "Priority email + chat", "Exclusive promos")

**Benefits 3-pillar**:
- 🎁 **Redeem local rewards** → Shop
- ⚡ **+10%/+15%/+20% at promo hotels** → Find Hotel
- 🏆 **Rank up + collect stamps** → Stamps 탭

**Active Promo Hotels 카드**:
- 6개 프로모 호텔 (Lotte Hanoi +20% flash 최상단)
- 각 카드 "Book now · +15% ELS" 버튼만 클릭 (카드 전체 X)
- 개인 tier × hotel boost 반영된 per-$1,000 예상 ELS 표시

**Wallet Activity**:
- 모든 거래 통합 (Earned-Booking / Used-Redeem)
- **Export CSV** 버튼

### 6.2 Shop 탭
- 국가별 자동 필터 (한국 OP는 한국 상품만, 30개+ 상품)
- **🔥 Best Seller 배지** (5개 큐레이션 + 👥 "1,842 redeemed this month" 소셜프루프)
- 3-20 ELS 범위 (30~40% 인하 가격)
- Redeem → 쿠폰 코드 생성 → **My Coupons 탭** 자동 이동

### 6.3 My Coupons 탭
- 쿠폰 vault (내 ELS 교환 이력)
- 코드 복사 + 만료일 + Active/Used/Expired 상태
- **14일 이내 만료 시 상단 앰버 배너 경고** (Wallet 탭에서)

**대본**:
> "이게 오늘 추가의 핵심입니다. ELS는 OP 개인 소유의 비양도성 코인이에요. $1,000 예약 → Gold tier(1.2×) × Peninsula(+15%) = 13 ELS. 이전 설계는 720 ELS였는데, 실물 마진 ₩3,500을 감안해 **100배 축소**했습니다. 국가별 로컬 카탈로그 — 한국 OP는 스타벅스/쿠팡, 일본 OP는 Rakuten/Amazon JP 등. Send/Receive는 의도적으로 없습니다 — 개인 소유 원칙."

---

## Chapter 7 — Stamp Passport ⭐⭐ (3분)

**경로**: Rewards → **Stamps 탭**

### 7.1 Hero 카드 (빈티지 여권)
- 크로스해치 종이 배경 + 점선 테두리
- **3/23 stamped · 13%** progress bar (5색 그라디언트)
- **희귀도 roll-up**: Common/Rare/Epic/Legendary/Mythic earned/total
- **ELS from stamps**: +15 earned / 3,280 locked

### 7.2 5개 카테고리 × 23 스탬프
- 🎯 **First-times** (3): First Booking, First Redeem, First Review
- 🏆 **Milestones** (6): 🌱 Rookie(10) → 🏆 Legend(5,000) → ⚔️ Immortal(10,000)
- 👑 **Tiers** (4): Silver → Gold → Platinum → 💎 Diamond
- 🌍 **Explorer** (4): International → Triple Crown → Continental → 🌍 World Conqueror
- 🔥 **Habits** (6): Big Spender → 🐋 Whale → 3-Year → 🗿 Eternal(10Y)

### 7.3 각 스탬프 카드
- Earned: 희귀도 ring shadow (Mythic은 무지개 다중 glow) + 회전 스탬프 + ✓ 획득일 + 👥 global %
- Locked: 🔒 + 진행률 바 + 조건 ("47 / 250 bookings · 18%")
- **+N ELS 리워드 칩** (Common 5 / Rare 15 / Epic 50 / Legendary 200 / Mythic 1,000)

**대본**:
> "정복감이 목표입니다. Mythic 스탬프는 5~10년 걸리게 설계해서 장기 retention 레버로 씁니다. 전부 모으면 평생 ~3,295 ELS. 🗿 Eternal (10-Year) 같은 건 글로벌 OP 중 0.2%만 획득 — **fewer than 10 OPs ever**라고 적혀있죠."

---

## Chapter 8 — OP Hotel Reviews 플라이휠 ⭐⭐ (4분, 핵심 차별점)

**경로**: Find Hotel → 아무 호텔 (Grand Hyatt Seoul 권장) → **OP Reviews 탭**

### 8.1 Summary 카드
- ✓ **OP-verified 배지** + "Professional OP Reviews" 설명
- 평균 별점 (큰 별) + 총 리뷰 수 (예: 9.2 · 3 OP reviews)
- **💡 Top 5 Tips** (cross-review aggregation 자동 집계)
- **"Write a review · 최대 +12 ELS 보상"** CTA

### 8.2 개별 리뷰 카드 (rev-001: James Park, Grand Hyatt Seoul)
- 작성자 아바타 + 회사 + 🇰🇷 Korea + "✓ Verified stay" 배지
- 5-star rating
- 제목 "Best business pick in Gangnam" + 본문
- **🏷️ OP Tips** (파란 칩): "Request 20F+ for Han River view", "Avoid 3F-7F (pool noise)", "Exec lounge on 23F opens 07:00"
- **📸 사진 갤러리** (3장): 클릭 → 블랙 lightbox 확대
- **Helpful 투표** (👍 47)

### 8.3 Write Review 인라인 폼 (팝업 아님!)
- "Write a review" 클릭 → 같은 페이지에서 펼침
- **2-column 레이아웃**:
  - 좌: 별점 + 헤드라인 + 상세 본문 (7 rows)
  - 우: 팁 (line-by-line) + **4-slot 사진 업로드** + 실시간 ELS 프리뷰
- **리워드 프리뷰** 실시간 계산:
  - +3 base (80+ 본문 + 1+ 팁)
  - +2 quality (300+ 본문 OR 4+ tips)
  - +2 photo (1장+)
  - +5 first-review (평생 1회)
  - **최대 +12 ELS**
- Submit 버튼 비활성 → 품질 게이트 충족 시 오렌지 활성화
- Discard (드래프트 삭제) / X 접기 (드래프트 유지)

### 8.4 B2C Syndication 안내 배너
"These reviews reach end consumers — approved OP reviews are syndicated (anonymized) to our B2C discovery layer."

**대본**:
> "여기가 DOTBIZ의 **핵심 차별점**입니다. 가설은 단순합니다 — OP 1,000명이 평균 5개 리뷰 쓰면 5,000개의 **프로페셔널 리뷰**가 쌓입니다. 이걸 B2C 레이어로 신디케이션하면, DOTBIZ는 **호텔 검색의 신뢰 계층**이 됩니다. OP는 리뷰 쓸 때마다 최대 12 ELS를 받지만, 월 5개 캡 + 품질 게이트 + 자동/수동 모더레이션으로 spam을 막습니다. 모든 OTA (Booking, Expedia, Agoda)가 하는 걸, 우린 **B2B 품질**로 합니다."

---

## Chapter 9 — Master Account (3분)

**경로**: 사이드바 → **Master Account** (Master 전용)

### 9.1 탭 구조
1. **Sub-accounts** — 17건 시드, 실제 작동하는 Actions:
   - Add Sub-account (초대링크 이메일 전송 시뮬)
   - Activate / Deactivate / Role change
   - Booking Scope (Own / All-company)
   - Notification Scope (Own / All-company)
2. **Payment Cards** (PREPAY만) — 직접 등록 가능, max 3장
3. **Voucher Setting** — 실제 로고 업로드 + 바우처 preview
4. **Team Leaderboard** ⭐ (ELS 신규) — OP별 순위, 🥇🥈🥉 medals, 티어 배지
5. **Billing Settings** — 회사 정산 타입 / 디포짓 종류 / 정산 주기 / 입금 기한 (계약 연동, 읽기 전용)

**대본**:
> "Master 계정은 회사를 대표하는 권한으로, 서브계정 관리 + 카드 관리 + 바우처 브랜딩 + 팀 리더보드까지 담당합니다. **2FA/Active Sessions는 ELLIS에서 관리** — 고객이 설정 못 바꿉니다 (Critical 알림 못 끄게). **Departments 개념은 완전 삭제** — 사용 안 하는 복잡도 제거."

---

## Chapter 10 — My Account + Notifications (2분)

### 10.1 My Account
**경로**: 팝오버 → My Account

- 극단 단순화: **Profile + Password 인라인만**
- Full Name 필수 검증 (빈 값 시 Save 비활성)
- Email **읽기 전용** (변경 불가, Master 문의)
- **My ELS Wallet 미니 위젯** ⭐ (balance + tier + Open Rewards 링크)
- **Company Information** (계약 연동, 읽기 전용)

### 10.2 Notifications ⭐ (볼륨 이상치 신규)
**경로**: 사이드바 → Notifications 또는 상단 벨 아이콘

- 26개 알림 타입, Category filter (Settlement / Booking / Dispute / Account)
- 인라인 **Mark all read** + **Unread only**
- ⭐ **Booking 탭에 볼륨 이상치 알림 4건**:
  - 🟡 TravelCo UI Spike: "24 bookings today (3× normal)"
  - 🟡 GOTADI API Drop: "0 in last 24h (baseline 12/day)"
  - 🟡 Asia Tours UI Drop: "3 consecutive days, 0 bookings"
  - 🔴 VVC API Spike: "47 bookings in 1 hour"
- 클릭 시 action deep link (예: /app/bookings?channel=api)

**대본**:
> "볼륨 이상치 알림은 API 연동 업체(GOTADI, VVC) 장애 조기 감지용입니다. 0건이면 토큰 만료, spike면 스크립트 폭주 가능성. 고객사 보호 + DOTBIZ 수익 손실 방지 양쪽 레버입니다."

---

## Chapter 11 — ELS Economics Admin ⭐⭐ (4분, 거버넌스)

**경로**: 사이드바 → Admin → **ELS Economics** (Master role gated, ELLIS preview)

### 11.1 KPI 헤더
- **Pending Approvals: 3** (빨간색)
- Tunable Parameters: 17
- Critical Items: 5
- **Budget Cap: — (not yet set)** ← ⚠️ 결재 대기 플래그

### 11.2 Parameters 탭 (17개 카드)
카테고리 필터: Economics / Promotions / Shop / Gamification / Policy / Content

각 카드:
- Impact 배지 (Critical 핑크 / High 골드 / Medium 시안 / Low 회색)
- 현재값 + 예산 영향
- **승인 체인 시각화** (예: CFO → CEO)
- **"Request Change"** 버튼 → 다이얼로그 (제안값 / 사유 / 영향 분석)

### 11.3 Requests 탭 — 실제 audit log
- 🟡 **apr-001**: CMO의 Earn rate +20% 요청 — CFO ✅ → **CEO 대기 중**
- ✅ **apr-010**: 오늘 처리한 100× 축소 변경의 영구 기록
- ✅ **apr-011**: 프로모 2-5× → 1.1-1.2× (CMO → CFO → CEO 3단 승인 완료)
- ✅ **apr-012**: Shop 가격 30-40% 인하
- ❌ **apr-020**: P2P 송금 요청 **CEO 거절** + 이유 ("ELS stays tied to the OP who earned it. Clean attribution wins.")

### 11.4 Approval Matrix 탭
- 17개 항목 Impact 순 정렬
- 각 행: 카테고리 · 파라미터 · Impact · **체인** · 주기
- Legend: Impact 등급 + 한국어 Approver 설명 (CEO=대표이사, CFO=재무이사 등)

**대본**:
> "여기서 OP 리워드 경제의 어떤 것도 단독으로 바꿀 수 없습니다. 오늘 earn rate 100× 축소도 apr-010으로 기록 — 영구 보존. **대표님 결재가 필요한 첫 번째 큰 건은 월 예산 캡 설정입니다** (현재 uncapped). Q2 OP 확대 전 결정 필수. 제안값 ₩50M/월 있지만, ₩120M 현상유지, ₩150M 성장형 중 선택 부탁드립니다."

---

## Chapter 12 — OhMy Blog + FAQ (2분)

### 12.1 OhMy Blog ⭐ (확장)
**경로**: 사이드바 → Resources → OhMy Blog

- 4 → **20 아티클** (오늘 확장)
- 4 카테고리 필터 (Featured / New Opening / Luxury / Business) 작동 + (N) 카운트
- **All Articles 아카이브** (하단) + 검색 (title / 저자 / 카테고리)
- 여행 가이드 기사: Seoul 스파 지도, Tokyo 라멘, Hanoi 스트릿푸드, Shanghai 클라이언트 접대 등

### 12.2 FAQ (Knowledge Base)
**경로**: 사이드바 → Resources → FAQ Board

- 11개 visual guide (step-by-step carousel)
- 주제: 첫 예약, Credit 관리, 인보이스, 프로모션 활용, 분쟁 대응 등
- 각 가이드 step 넘기기 + 관련 페이지 딥링크

---

## Chapter 13 — 추가 기능 (1분, 참고용)

### 13.1 Map Search (`/app/map-search`)
- Leaflet 지도에서 호텔 pin으로 탐색
- Cluster + 가격 마커

### 13.2 Favorites (`/app/favorites`, 🤍 헤더 아이콘)
- 즐겨찾는 호텔 목록 관리

### 13.3 Monthly Rates (`/app/monthly-rates`)
- 월별 rate 관리 (기업 계약용)

### 13.4 Markup Sharing (`/app/markup-sharing`)
- 바우처/컨펌 페이지 브랜딩 공유

---

## 🎤 Q&A 대비 예상 질문 & 답변 (15분)

### Q1. "OP한테 돈을 너무 많이 주는 것 아닌가?"
**A**: "실물 마진의 15~40% 범위로 조정했습니다. 일반 OP 월 54 ELS = ₩54,000 상당, GMV ₩4,500,000 대비 1.2%. 업계 벤치마크 Marriott Bonvoy B2B 1%, IHG 0.5%와 비슷한 수준입니다. **월 예산 캡이 설정되면 상한이 명확해집니다** — 오늘 결재 요청드립니다."

### Q2. "리뷰는 품질 보장 어떻게?"
**A**: "3단계 방어선:
1. 품질 게이트 (80자 + 1 팁 미만은 보상 0)
2. Approval 단계 (Pending → Approved 모더레이션)
3. 월 5개 리뷰 캡 + 1회/호텔 제한
OTA 업계(Booking, Expedia)와 동일한 표준입니다."

### Q3. "ELS 양도 안 되면 OP가 아쉬워하지 않을까?"
**A**: "두 가지 고려:
1. **개인 소유 → lock-in 강화**: OP가 자신만 받는 보상이라 DOTBIZ 이탈 시 손실 명확
2. **Gift-laundering 방지**: 팀 내 집중, AML/KYC 복잡도 증가 방지
CMO가 한 번 enable 요청했지만 (apr-020), CEO 거절 기록 보존했습니다."

### Q4. "API 파트너가 리뷰 쓸 수 있나?"
**A**: "예. `gotadi@dotbiz.com` (GOTADI API 파트너)으로 로그인해도 Rewards + 리뷰 접근 가능. 시드 데이터 중 rev-011, rev-030이 베트남 OP 리뷰입니다."

### Q5. "ELLIS admin은 실제로 언제 구현?"
**A**: "현재 DOTBIZ 프로토타입에 preview로 포함. 실제로는 별도 admin 앱 (Phase 2). 승인 워크플로우 로직과 데이터 모델은 오늘 모두 정의했으므로, ELLIS 앱 착수 시 그대로 이식 가능합니다."

### Q6. "DIDA 커버리지는 어느 정도?"
**A**: "65/68 = **95.6%** 완료. 미구현 3개는 내부 보조 기능으로, 핵심 OP 업무 플로우는 100%. Gap analysis 문서(`DIDA_Gap_Analysis_v2.0.docx`)에 상세."

### Q7. "멀티엔티티 (GOTADI처럼 2개국 계약) 어떻게 처리?"
**A**: "Company 하나에 여러 Contract (계약) 연결. Invoice는 계약별 분리 발행, AR/Billing은 계약 필터 적용. 데모 계정 `gotadi@dotbiz.com`에서 확인 가능합니다."

### Q8. "프로모 호텔 마진 관리는?"
**A**: "프로모 호텔도 **동일 7-8% 마크업** — 추가 수수료 없습니다. 그래서 프로모 배수를 처음 설계의 2×/3×/5× → **1.1×/1.15×/1.2×로 낮췄습니다** (apr-011). 실제 감당 가능 범위."

### Q9. "Budget cap 제안액 ₩50M/월 근거?"
**A**: "현재 활성 OP 2,000명 × 월평균 50 ELS = ₩100M/월 추정. 대안:
- **보수적**: ₩50M (강제 부족으로 재조정 신호 발생)
- **현상유지**: ₩120M
- **성장용**: ₩150M
대표님께서 결정 주시면 earn rate 1차 추가 조정 함께 하겠습니다."

---

## 🚦 시연 중 주의사항

- **로컬스토리지 캐시**: 이전 로그인 정보 남아 있을 수 있음 — 시연 전 **로그아웃 후 재로그인** 필수
- **스탬프 팝업**: Booking Complete 후 첫 시연 시 welcome modal — 예상된 동작
- **Active Promo 카드**: 카드 전체 클릭 안 되고 **Book now 버튼만** 클릭됨 (의도된 UX)
- **CDN 지연**: gh-pages 배포 후 1-2분, **Ctrl+Shift+R 하드 리프레시** 안내
- **멀티엔티티 시연**: `gotadi@dotbiz.com` 로그인 후 Settlement 탭에서 SG/VN 계약 분리 확인

---

## 📊 핵심 수치 (한눈에)

| 지표 | 값 | 증감 (v1 대비) |
|-----|-----|--------------|
| 페이지 | **28개** | +2 |
| Mock 파일 | **22개** | +8 |
| 테스트 | **91/91 passing** | +6 |
| DIDA 커버리지 | **95.6%** (65/68) | — |
| 기획 점수 | **94/100 (A)** | +5 |
| QA 점수 | **91/100 (A-)** | +3 |

**데모 URL**: https://bstars00-rgb.github.io/Dotbiz/
**1차 리뷰**: 2026-04-24 (금)
**소요**: 45분 데모 + 15분 Q&A = **60분 전체**

---

## 📑 부속 문서

- **CEO_Report_v2_2026-04-23.md** (또는 `.docx`) — 대표이사 보고서
- **Approval_Spec_v1_2026-04-23.md** (또는 `.docx`) — 승인 매트릭스 상세
- 이전 버전 비교: `CEO_Report_v1_2026-04-17.md`, `DIDA_Gap_Analysis_v2.0.docx`

---

**Good luck with the review! 🎯**
