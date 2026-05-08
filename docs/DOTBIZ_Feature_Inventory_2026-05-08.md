# DOTBIZ 전체 기능 인벤토리 (Feature Inventory)

**작성일**: 2026-05-08
**버전**: 1.0
**페이지 수**: 27개
**총 LOC**: ~16,100 (페이지만, 컴포넌트/훅 제외)

---

## 📊 구조

```
WORK (고객사 일일 사용)
├─ Dashboard
├─ Find Hotel → Search Results → Hotel Detail → Booking Form → Booking Confirm → Booking Complete → Bookings
├─ Settlement → Settlement Detail
└─ Tickets

ADMIN (자사 운영)
├─ Notifications
├─ Master Account (Client Management)
└─ My Account

RESOURCES
├─ FAQ Board
├─ OhMy Blog
├─ Rewards Mall (Wallet/Stamps/Shop/Vault)
└─ Campaign

기타 기능
├─ Map Search / Hotel Map View
├─ Markup Sharing
├─ Favorites
├─ Monthly Rate
└─ Contact

인증 (Standalone)
├─ Login
└─ Registration
```

---

## 1. Dashboard (`/app/dashboard`)

| 영역 | 내용 |
|------|------|
| **KPI 4종** | 예약 중심: Total Bookings / TTV / Avg Rate / Cancel Rate |
| **12-Month TTV Trend** | Apr-25 ~ Mar-26 (연도 표기) |
| **Destination Booking %** | 국가/도시별 비중 + 월별 데이터 |
| **Top Hotels** | 베스트셀링 호텔 |
| **My Activities** | 최근 예약 / 정산 / 티켓 |

**원칙**: 미니멀 — 4 KPI만. AR/Dispute/SLA/Tier 운영 지표는 각 전용 페이지에서.

---

## 2. Find Hotel (`/app/find-hotel`)

| 기능 | 설명 |
|------|------|
| **통합 검색** | Region / Hotel / POI / **Hotel Code** (숫자) |
| **Hotel Code 검색** | 6~7자리 숫자 → 즉시 호텔 상세로 이동 |
| **Active ELS Boosters** | 이번 주 부스터 호텔 (1.0~1.25× 표시) |
| **Recent Searches** | localStorage 기반 6건 |
| **Date Picker** | Check-in/out, 야간 자동 보정 |
| **Room Picker** | Rooms / Adults / Children + 아이 나이 |

---

## 3. Search Results (`/app/search-results`)

| 기능 | 설명 |
|------|------|
| 호텔 리스트 | 가격/별점/리뷰순 정렬 |
| 필터 | 별점, 가격대, 편의시설, 브랜드 |
| 호텔 카드 | 가격, 무료 취소 여부, ELS 적립 예상 |

---

## 4. Hotel Detail (`/app/hotel/:hotelId`)

| 기능 | 설명 |
|------|------|
| 호텔 정보 | 사진, 주소, 별점, 리뷰, 편의시설 |
| 객실 목록 | Room Type / Bed / Meal / 가격 (Billing Gross/Discount/Sum) |
| Rate Plan Copy | 텍스트 복사 (고객 공유용) |
| Cancellation Policy | Free / Non-refundable 명시 |

---

## 5. Booking Form (`/app/booking/form`)

| 기능 | 설명 |
|------|------|
| Travelers | Last/First Name, Gender, Local Name, Child Birthday |
| **Expected ELS** | 체크아웃 시 적립 예정 (간결 표시) |
| **Billing Type 분기** | PREPAY: 즉시 결제 / POSTPAY: Net-30 정산 |
| **PaymentDialog** | Non-refundable / TL 경과 시 PG 카드결제 |
| **ELS 차감** | OP 본인 ELS로 일부 결제 (Tier별 차등 비율) |
| **24h Draft** | localStorage 자동 저장 |
| **FX Lock** | 예약 시점 환율 고정 |

---

## 6. Booking Confirm / Complete (`/app/booking/confirm`, `/complete`)

| 기능 | 설명 |
|------|------|
| Confirm | 정산 안내 (PREPAY/POSTPAY 별 메시지) |
| Complete | Voucher 발급 (QR 미사용), Invoice 첨부 (PDF+CSV) |

---

## 7. Bookings (`/app/bookings`)

| 기능 | 설명 |
|------|------|
| 8 컬럼 리스트 | 행 클릭 → 상세 다이얼로그 |
| Quick Filter | All / Confirmed / Cancelled / Pending |
| **Source 필터** | ❌ 폐기 (UI/API 구분 불필요) |
| Free Cancellation 카운트 | 24h / 3d 임박 |
| Upcoming Bookings | 24h / 3d 체크인 |
| Cancel | Free Cancel만 (Non-refundable 차단) |
| **Amend** | ❌ 제거됨 (수정 불가, 취소 후 재예약) |

---

## 8. Settlement (`/app/settlement`)

| 기능 | 설명 |
|------|------|
| **AR Aging** | 6 buckets (Current/1-30/31-60/61-90/90+/Disputed) |
| **PREPAY/POSTPAY 분리** | 각 별도 탭 |
| **Floating Deposit** | 잔액 표시, 자동 차감 |
| **Invoice 매칭** | InvoiceWithMatch 단일 진실 소스 |
| **Cash basis** | 입금일 기준 인식 |
| **Credit Note** | 별도 발행 (원본 수정 X) |
| **CSV Export** | 회계 보고용 |

---

## 9. Settlement Detail (`/app/settlement/invoice/:invoiceNo`)

| 기능 | 설명 |
|------|------|
| Invoice 상세 | 발행 정보, 라인 아이템, 입금 기록 |
| Dispute | 사유 영구 보존, status 전환만 |
| 입금 매칭 | 받은 금액 vs 청구 금액 |

---

## 10. Tickets (`/app/tickets`)

| 기능 | 설명 |
|------|------|
| 티켓 목록 | OP 작성 (자사) + EllisOP 처리 (모든 회사) |
| Settlement Dispute | 정산 분쟁은 티켓 트랙 |
| **SLA** | High 4h / Medium 24h / Low 72h (영업시간 기준) |
| **Critical 트랙** | 부정결제·시스템장애 24x7 |
| Trace Log | AI-assisted 처리 기록 |

---

## 11. Master Account / Client Management (`/app/client`)

| 기능 | 설명 |
|------|------|
| 자사 OP 관리 | 등록/수정/삭제 |
| 계약 관리 | Contract per OhMyHotel Entity |
| **Billing Type 설정** | PREPAY/POSTPAY, 디포짓 종류 |
| **Settlement Cycle** | Monthly / Bi-weekly / Weekly |
| OP 0명 경고 배너 | ELS 적립 작동 안 함 |

---

## 12. Notifications (`/app/notifications`)

| 기능 | 설명 |
|------|------|
| 알림 분류 | Booking / Payment / Ticket / Settlement / Topup / Contract |
| 라우팅 정책 | 시스템 자동 (alertRouting.ts) |
| Quiet Hours | 야간 알림 억제 |
| 그룹핑 | 동일 카테고리 묶음 |

---

## 13. My Account (`/app/my-account`)

| 기능 | 설명 |
|------|------|
| Profile | 이름, 이메일, 전화 |
| Language | EN/KO/JA/ZH/VI |
| Theme | Light / Dark |
| Password | 변경 |

---

## 14. FAQ Board (`/app/faq`)

| 기능 | 설명 |
|------|------|
| 카테고리 분류 | 검색 / 예약 / 정산 / 결제 / 기타 |
| 검색 | 질문/답변 텍스트 |

---

## 15. OhMy Blog (`/app/blog`, `/app/blog/:articleId`)

| 기능 | 설명 |
|------|------|
| 호텔 블로그 콘텐츠 | 마케팅 글 |
| 다국어 발행 | 사용자 locale 자동 |

---

## 16. Rewards Mall (`/app/rewards`)

| 탭 | 설명 |
|------|------|
| **Wallet** | ELS 잔액, Tier 표시, 6단계 진척도, Rolling 12mo 강등 안내 |
| **Stamps** | 마일스톤 / 로얄티 스탬프 (활동 기준) |
| **Shop** | 디지털 상품 redeem (Min 10 ELS), Tier 잠금 X |
| **Vault** | 보유 쿠폰 (Active/Used/Expired) |

**핵심 정책**:
- 가격 노출 X (Face value 숨김)
- 단위 통일: "ELS"
- 쿠폰 자동 발급 X (운영팀 24h 내 수동)
- ELS 영구 보존 (회수 X)

---

## 17. Campaign (`/app/campaign/:campaignId`)

| 기능 | 설명 |
|------|------|
| 기획전 페이지 | 시즌 프로모, 호텔 큐레이션 |

---

## 18. Map Search (`/app/map-search`)

| 기능 | 설명 |
|------|------|
| Leaflet 지도 | 호텔 마커, 가격 라벨 |

---

## 19. Hotel Map View (`/app/hotel-map`)

| 기능 | 설명 |
|------|------|
| 위치 기반 호텔 탐색 | 지도 + 리스트 분할 뷰 |

---

## 20. Markup Sharing (`/app/markup-sharing`)

| 기능 | 설명 |
|------|------|
| 마크업 공유 | 가격 인상분 공유 (B2B 협업) |

---

## 21. Favorites (`/app/favorites`)

| 기능 | 설명 |
|------|------|
| 즐겨찾기 호텔 | 빠른 재예약 |

---

## 22. Monthly Rate (`/app/monthly-rates`)

| 기능 | 설명 |
|------|------|
| 월별 요금 | 시즌별 가격 추이 |

---

## 23. Contact (`/app/contact`)

| 기능 | 설명 |
|------|------|
| 문의 | 이메일/전화 정보, 양식 |

---

## 24. Login / Registration (`/login`, `/register`)

| 기능 | 설명 |
|------|------|
| Login | 이메일/비밀번호, 데모 계정 4종 |
| Registration | 신규 OP/Master 가입 |

---

## ❌ 삭제된 페이지 (ELLIS/CMS로 이전)

| 페이지 | 사유 | 명세서 |
|--------|------|--------|
| ~~AdminEconomicsPage~~ | ELS 경제 정책 튜닝 | `Admin_Out_Of_Scope.md` |
| ~~AdminReviewsPage~~ | 리뷰 모더레이션 | 동 |
| ~~Risk Dashboard~~ | 리스크 추적 | 동 |

---

## 🧩 공통 컴포넌트

| 컴포넌트 | 용도 |
|---------|------|
| `ErrorBoundary` | 페이지별 에러 격리 |
| `PaymentDialog` | PG 결제 시뮬레이션 (PREPAY) |
| `GroupBookingDialog` | 단체 예약 일괄 업로드 |
| `StateToolbar` | success/loading/error/empty 상태 전환 (개발자 도구) |
| `InvoiceEmailDialog` | 인보이스 이메일 발송 |
| `InvoicePreviewDialog` | 인보이스 미리보기 |
| `AlertPreferencesPanel` | 알림 환경 설정 |
| 공통 UI | Button/Card/Input/Badge/Tabs/Alert/Skeleton (shadcn 기반) |

---

## 🪝 커스텀 훅

| 훅 | 용도 |
|------|------|
| `useScreenState` | success/loading/error/empty 상태 |
| `useTabParam` | URL 쿼리 기반 탭 상태 |
| `useFormValidation` | 폼 검증 |
| `useAuth` | AuthContext 접근 |
| `useI18n` | 다국어 t() |
| `useTickets` | 티켓 컨텍스트 |

---

## 📚 도메인 모델 (mocks/)

| 파일 | 모델 |
|------|------|
| `rewards.ts` | ELS, Tier, Stamp, Boost, **POLICY_CHANGELOG** |
| `settlement.ts` | InvoiceWithMatch, AR Aging, PREPAY/POSTPAY |
| `bookings.ts` | Booking, BookingStatus |
| `hotels.ts` | Hotel (id, **hotelCode**, name, rooms) |
| `rooms.ts` | Room |
| `companies.ts` | 자사 + 고객사 |
| `clientManagement.ts` | OP/계약 관리, billingType, depositType |
| `users.ts` | 사용자 디렉토리 |
| `tickets.ts` | 티켓 트랙 |
| `notifications.ts` | 알림 |
| `alerts.ts` | 시스템 알림 |
| `dashboard.ts` | KPI, TTV Trend, 통계 |
| `reviews.ts` | 호텔 리뷰, AutoMod |
| `contracts.ts` | 계약 |
| `ohMyHotelEntities.ts` | OhMyHotel 다국가 법인 (omh-sg, omh-jp 등) |
| `operatingPartners.ts` | 운영 파트너 |
| `products.ts` | (legacy) |
| `topUp.ts` | 충전 |
| `dataCenter.ts` | 데이터 센터 |
| `faqs.ts` | FAQ |
| `guides.ts` | 가이드 |
| `approvals.ts` | 결재 시스템 |

---

**문서 위치**: `docs/DOTBIZ_Feature_Inventory_2026-05-08.md`
**짝 문서**: `docs/DOTBIZ_Developer_Handoff_2026-05-08.md`
