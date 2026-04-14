## 4. Screen Definitions

@layout: _shared/main-layout

---

### Screen: Login

**Purpose**: 이메일/비밀번호 기반 로그인 화면

**Entry Points**: 앱 최초 접근, 세션 만료 시

**Layout**:
```
+--------------------------------------------------+
| [ Header ]                                       |
| - Logo (DOTBIZ)             - DarkModeToggle     |
+--------------------------------------------------+
| [ Login Form ]                                   |
|                                                  |
|   - AnimatedBackground (Tech 스타일)             |
|                                                  |
|   +------------------------------------------+   |
|   | - EmailInput                             |   |
|   | - PasswordInput                          |   |
|   | - RememberMeCheckbox                     |   |
|   | - LoginButton                            |   |
|   | - ForgotPasswordLink                     |   |
|   | - RegisterLink                           |   |
|   +------------------------------------------+   |
|                                                  |
+--------------------------------------------------+
```

**Components**:
| Component | Type | Behavior |
|-----------|------|----------|
| Logo | Image | DOTBIZ 브랜드 로고 |
| DarkModeToggle | Button | 🌙/☀️ 다크/라이트 모드 전환 |
| AnimatedBackground | Canvas | Tech 스타일 애니메이션 배경 |
| EmailInput | Input | 이메일 입력, Remember Me 시 자동완성 |
| PasswordInput | Input | 비밀번호 입력, show/hide 토글 |
| RememberMeCheckbox | Checkbox | localStorage에 이메일 저장 |
| LoginButton | Button | 로그인 실행 |
| ForgotPasswordLink | Link | 비밀번호 재설정 화면으로 이동 |
| RegisterLink | Link | 회원가입 페이지로 이동 |

**User Actions**:
| Action | Trigger | Result |
|--------|---------|--------|
| 로그인 | LoginButton 클릭 | 자격증명 검증 → Dashboard 이동 |
| 비밀번호 찾기 | ForgotPasswordLink 클릭 | 비밀번호 재설정 화면 이동 |
| 회원가입 | RegisterLink 클릭 | Registration 페이지 이동 |
| 다크모드 전환 | DarkModeToggle 클릭 | 테마 전환, localStorage 저장 |

---

### Screen: Registration

**Purpose**: 3-Step 회원가입 프로세스

**Entry Points**: Login 화면의 RegisterLink

**Layout**:
```
+--------------------------------------------------+
| [ Header ]                                       |
| - Logo                      - DarkModeToggle     |
+--------------------------------------------------+
| [ StepIndicator ]                                |
| - Step1(회사정보)  Step2(사용자)  Step3(계약동의) |
+--------------------------------------------------+
| [ FormContent ]                                  |
|                                                  |
|   Step 1:                                        |
|   - CompanyNameInput                             |
|   - BusinessRegNoInput                           |
|   - BusinessTypeSelect (선불/후불)               |
|   - AddressInput                                 |
|   - PhoneInput                                   |
|   - CompanyEmailInput                            |
|                                                  |
|   Step 2:                                        |
|   - FullNameInput                                |
|   - PositionInput                                |
|   - UserEmailInput                               |
|   - PasswordInput                                |
|   - MobileInput                                  |
|   - LanguageSelect                               |
|                                                  |
|   Step 3:                                        |
|   - TermsCheckbox (B2B 이용약관)                 |
|   - ContractDownloadButton                       |
|                                                  |
+--------------------------------------------------+
| [ FormActions ]                                  |
| - BackButton                - NextButton         |
+--------------------------------------------------+
```

**Components**:
| Component | Type | Behavior |
|-----------|------|----------|
| StepIndicator | Stepper | 현재 단계 표시 (1/2/3) |
| CompanyNameInput | Input | 회사명 입력 (필수) |
| BusinessRegNoInput | Input | 사업자등록번호 (필수) |
| BusinessTypeSelect | Select | 선불/후불 업체 유형 |
| AddressInput | Input | 주소 입력 |
| PhoneInput | Input | 전화번호 입력 |
| CompanyEmailInput | Input | 회사 이메일 (필수) |
| FullNameInput | Input | 이름 (필수) |
| PositionInput | Input | 직책 |
| UserEmailInput | Input | 사용자 이메일 (필수) |
| PasswordInput | Input | 비밀번호 (필수, 8~128자, 영문+숫자+특수문자) |
| PasswordConfirmInput | Input | 비밀번호 확인 (PasswordInput과 일치 필수) |
| MobileInput | Input | 휴대폰 번호 |
| LanguageSelect | Select | 선호 언어 (5개) |
| TermsCheckbox | Checkbox | B2B 이용약관 동의 (필수) |
| ContractDownloadButton | Button | 계약서 PDF 다운로드 |
| BackButton | Button | 이전 Step 이동 |
| NextButton | Button | 다음 Step / 완료 |

**User Actions**:
| Action | Trigger | Result |
|--------|---------|--------|
| 다음 단계 | NextButton 클릭 | 필수 필드 검증 → 다음 Step |
| 이전 단계 | BackButton 클릭 | 이전 Step으로 이동 (입력 유지) |
| 계약서 다운로드 | ContractDownloadButton 클릭 | PDF 파일 다운로드 |
| 가입 완료 | Step 3 완료 | Pending 상태 안내 메시지 표시 |

---

### Screen: Dashboard

**Purpose**: KPI 요약 및 비즈니스 분석 대시보드

**Entry Points**: 로그인 후 기본 화면, 사이드바 메뉴

**Layout**:
```
+--------------------------------------------------+
| [ TopBar ]                                       |
| - SearchGlobal  - CurrencySelect  - LangSelect  |
| - DarkModeToggle  - NotificationBell  - Profile  |
+--------------------------------------------------+
| [ Sidebar ]    || [ MainContent ]                |
| - Logo         ||                                |
| - NavMenu:     || [ KPICards ]                   |
|   AI Assistant || - TotalBookings  - Revenue     |
|   Find Hotel   || - RoomNights  - AvgBookingVal  |
|   Dashboard    ||                                |
|   Bookings     || [ OPPointsWidget ]             |
|   Settlement*  || - Balance - Earned - Used       |
|   Notifications||                                |
|   FAQ Board    || [ TopHotels ]  || [ TTVTrend ] |
|   My Account   || - Hotel List   || - BarChart   |
|   Rewards Mall ||                                |
|                || [ BookingFunnel ]               |
|                || - FunnelChart                   |
|                ||                                |
|                || [ HotelProfitability ]          |
|                || - ProfitTable                   |
|                ||                                |
|                || [ OPPerformance ]  (Master)     |
|                || - ComparisonTable               |
|                ||                                |
|                || [ MyPerformance ]  (OP)         |
|                || - GaugeBars                     |
+--------------------------------------------------+
```
*Settlement은 Master 전용

**Components**:
| Component | Type | Behavior |
|-----------|------|----------|
| Sidebar | Navigation | 메뉴 항목, 현재 페이지 하이라이트 |
| TopBar | Header | 검색, 통화/언어/다크모드, 알림, 프로필 |
| KPICards | Card Grid | 4개 KPI + 전기 대비 증감률, 기간 필터 |
| OPPointsWidget | Card | 포인트 현황 컴팩트 위젯 |
| TopHotels | Table | 상위 5개 호텔 (건수, 금액) |
| TTVTrend | Chart | 12개월 CSS 바 차트 |
| BookingFunnel | Chart | 5단계 전환율 퍼널 |
| HotelProfitability | Table | 호텔별 수익성 (상위 5개) |
| OPPerformance | Table | OP별 실적 비교 (Master 전용) |
| MyPerformance | GaugeBar | 개인 KPI (OP 전용) |
| NotificationBell | Button | 알림 센터 이동, 미읽음 배지 |
| CurrencySelect | Dropdown | 10개 통화 선택 |
| LangSelect | Dropdown | 5개 언어 선택 |

**User Actions**:
| Action | Trigger | Result |
|--------|---------|--------|
| 기간 필터 변경 | KPICards 필터 선택 | 전체 위젯 데이터 갱신 |
| Rewards Mall 이동 | OPPointsWidget 링크 클릭 | Rewards Mall 페이지 이동 |
| 메뉴 이동 | Sidebar 메뉴 클릭 | 해당 페이지로 Hash 라우팅 |

---

### Screen: Find Hotel

**Purpose**: 호텔 검색 진입점 및 즐겨찾기

**Entry Points**: 사이드바 메뉴 "Find Hotel"

**Layout**:
```
+--------------------------------------------------+
| [ TopBar ] (공통)                                |
+--------------------------------------------------+
| [ Sidebar ] || [ MainContent ]                   |
|             ||                                   |
|             || [ SearchForm ]                    |
|             || - DestinationInput (자동완성)      |
|             || - CheckInPicker  - CheckOutPicker |
|             || - NightsDisplay                   |
|             || - RoomsSelect  - AdultsSelect     |
|             || - ChildrenSelect  - ChildAgeInputs|
|             || - NationalitySelect               |
|             || - SearchButton                    |
|             ||                                   |
|             || [ FavoriteHotels ]                |
|             || - FavoriteHotelCard (반복)         |
|             ||                                   |
+--------------------------------------------------+
```

**Components**:
| Component | Type | Behavior |
|-----------|------|----------|
| DestinationInput | Autocomplete | 도시/랜드마크/호텔명 자동완성 (아시아 주요 도시) |
| CheckInPicker | DatePicker | 체크인 날짜 선택 |
| CheckOutPicker | DatePicker | 체크아웃 날짜 선택 |
| NightsDisplay | Display | Nights 자동 계산 표시 |
| RoomsSelect | Select | 객실 수 선택 |
| AdultsSelect | Select | 성인 수 선택 |
| ChildrenSelect | Select | 어린이 수 선택 |
| ChildAgeInputs | Input[] | 어린이 연령 개별 입력 (동적 생성) |
| NationalitySelect | Select | 국적 선택 |
| SearchButton | Button | 검색 실행 |
| FavoriteHotelCard | Card | 즐겨찾기 호텔 카드 (이미지, 이름, 별점) |

**User Actions**:
| Action | Trigger | Result |
|--------|---------|--------|
| 검색 실행 | SearchButton 클릭 | Search Results 페이지 이동 |
| 즐겨찾기 호텔 클릭 | FavoriteHotelCard 클릭 | Hotel Detail 페이지 이동 |
| 어린이 수 변경 | ChildrenSelect 변경 | ChildAgeInputs 동적 추가/제거 |

---

### Screen: Search Results

**Purpose**: 호텔 검색 결과 (List View + Map View)

**Entry Points**: Find Hotel 검색 실행

**Layout**:
```
+--------------------------------------------------+
| [ TopBar ] (공통)                                |
+--------------------------------------------------+
| [ Sidebar ] || [ MainContent ]                   |
|             ||                                   |
|             || [ CompactSearchBar ]              |
|             || - Destination - Dates - Rooms     |
|             || - ModifyButton                    |
|             ||                                   |
|             || [ ViewToggle ]                    |
|             || - ListViewBtn  - MapViewBtn       |
|             || - SortDropdown                    |
|             || - ResultCount                     |
|             ||                                   |
|             || [ FilterSidebar ] || [ Results ]  |
|             || - StarRating     || (List View)   |
|             || - PriceRange     || - HotelCard   |
|             || - AreaFilter     ||   (반복)      |
|             || - AmenityFilter  ||               |
|             ||                  || (Map View)    |
|             ||                  || - LeafletMap  |
|             ||                  || - MapSidebar  |
|             ||                                   |
+--------------------------------------------------+
```

**Components**:
| Component | Type | Behavior |
|-----------|------|----------|
| CompactSearchBar | Form | 검색 조건 수정 가능한 컴팩트 바 |
| ViewToggle | ButtonGroup | List ↔ Map 뷰 전환 |
| SortDropdown | Dropdown | 추천순, 가격순(↑↓), 평점순 |
| ResultCount | Display | 검색 결과 건수 |
| FilterSidebar | Panel | 별점/가격/지역/어메니티 필터 |
| StarRating | CheckboxGroup | 5/4/3 Star 필터 |
| PriceRange | RangeSlider | $100 이하 ~ $300+ |
| AreaFilter | CheckboxGroup | 지역별 필터 |
| AmenityFilter | CheckboxGroup | Free Cancellation, Breakfast, Pool 등 |
| HotelCard | Card | 호텔 이미지, 이름, 별점, 평점, 가격, 배지, 즐겨찾기 |
| LeafletMap | Map | Leaflet.js 인터랙티브 지도 |
| MapSidebar | Panel | 지도 옆 호텔 리스트 (마커 연동) |

**User Actions**:
| Action | Trigger | Result |
|--------|---------|--------|
| 뷰 전환 | ViewToggle 클릭 | List ↔ Map 전환 |
| 필터 적용 | 필터 항목 변경 | 결과 즉시 필터링 |
| 정렬 변경 | SortDropdown 변경 | 결과 즉시 재정렬 |
| 호텔 선택 | HotelCard 클릭 | Hotel Detail 이동 |
| 즐겨찾기 | 별표 클릭 | 즐겨찾기 토글 |
| 마커 클릭 | 지도 마커 클릭 | 팝업 표시 + 리스트 하이라이트 |

---

### Screen: Hotel Detail

**Purpose**: 호텔 정보 및 객실 선택 (4개 탭)

**Entry Points**: Search Results 호텔 카드 클릭, AI 추천 호텔 클릭

**Layout**:
```
+--------------------------------------------------+
| [ TopBar ] (공통)                                |
+--------------------------------------------------+
| [ Sidebar ] || [ MainContent ]                   |
|             ||                                   |
|             || [ Breadcrumb ]                    |
|             || - Home > Search > HotelName       |
|             ||                                   |
|             || [ CompactSearchBar ]              |
|             || - Dates - Rooms - ModifyButton    |
|             ||                                   |
|             || [ HeroSection ]                   |
|             || - HotelImage  - HotelName         |
|             || - StarBadge  - RatingBadge        |
|             || - FavoriteButton                  |
|             ||                                   |
|             || [ TabNavigation ]                 |
|             || - RoomsTab  - OverviewTab         |
|             || - PoliciesTab  - FacilitiesTab    |
|             ||                                   |
|             || [ TabContent ]                    |
|             || (Rooms Tab)                       |
|             || - RoomFilter                      |
|             ||   - RoomTypeSelect                |
|             ||   - BedTypeSelect                 |
|             ||   - PriceRangeSelect              |
|             ||   - MealPlanSelect                |
|             ||   - RefundableCheckbox            |
|             || - RoomCard (반복)                  |
|             ||   - RoomName  - BedType           |
|             ||   - MaxGuests  - CancelPolicy     |
|             ||   - MealIncluded  - Price         |
|             ||   - SelectButton                  |
|             ||                                   |
|             || (Overview Tab)                    |
|             || - HotelDescription                |
|             || - Highlights  - Location           |
|             ||                                   |
|             || (Policies Tab)                    |
|             || - CheckInOut  - CancelPolicy      |
|             || - ChildPolicy  - PetPolicy        |
|             || - SmokingPolicy                   |
|             ||                                   |
|             || (Facilities Tab)                  |
|             || - FacilityGroup (반복)             |
|             ||   - CategoryTitle                 |
|             ||   - FacilityItem (아이콘+텍스트)   |
+--------------------------------------------------+
```

**Components**:
| Component | Type | Behavior |
|-----------|------|----------|
| Breadcrumb | Navigation | 계층 네비게이션 |
| HeroSection | Section | 호텔 이미지, 이름, 별점, 평점 |
| FavoriteButton | Button | 즐겨찾기 토글 |
| TabNavigation | Tabs | 4개 탭 전환 |
| RoomFilter | FilterBar | Room Type, Bed Type, Price, Meal, Refundable |
| RoomCard | Card | 객실 정보 + Select 버튼 |
| SelectButton | Button | 객실 선택 → 예약 폼 이동 |
| HotelDescription | Text | 호텔 소개 텍스트 |
| FacilityGroup | List | 카테고리별 시설 목록 |

**User Actions**:
| Action | Trigger | Result |
|--------|---------|--------|
| 탭 전환 | TabNavigation 클릭 | 해당 탭 콘텐츠 표시 |
| 객실 필터 | RoomFilter 변경 | 객실 목록 실시간 필터링 |
| 객실 선택 | SelectButton 클릭 | Booking Form 이동 |
| 검색 수정 | CompactSearchBar ModifyButton | 날짜/객실 수 변경 |

---

### Screen: Booking Form (Step 1)

**Purpose**: 게스트 정보 입력 및 결제수단 선택

**Entry Points**: Hotel Detail 객실 Select 버튼

**Layout**:
```
+--------------------------------------------------+
| [ TopBar ] (공통)                                |
+--------------------------------------------------+
| [ Sidebar ] || [ MainContent ]                   |
|             ||                                   |
|             || [ BookingStepIndicator ]           |
|             || - Step1(정보) Step2(확인) Step3(완료)|
|             ||                                   |
|             || [ GuestForm ]  || [ BookingSummary]|
|             || - FirstName    || - HotelName     |
|             || - LastName     || - RoomType      |
|             || - Email        || - CheckIn/Out   |
|             || - Mobile       || - Nights        |
|             || - SpecialReq   || - Guests        |
|             ||                || - RoomRate      |
|             || [ PaymentMethod]| - Tax           |
|             || (선불업체)     || - Total          |
|             || - CardSelect   ||                 |
|             || - RNPLOption   ||                 |
|             || (후불업체)     ||                 |
|             || - DepositOption||                 |
|             || - CreditOption ||                 |
|             ||                ||                 |
|             || [ FormActions ]                   |
|             || - BackButton   - ContinueButton   |
+--------------------------------------------------+
```

**Components**:
| Component | Type | Behavior |
|-----------|------|----------|
| BookingStepIndicator | Stepper | 예약 진행 단계 표시 (1/2/3) |
| FirstNameInput | Input | 게스트 이름 (필수) |
| LastNameInput | Input | 게스트 성 (필수) |
| EmailInput | Input | 게스트 이메일 (필수) |
| MobileInput | Input | 게스트 연락처 |
| SpecialRequests | Textarea | 특별 요청사항 |
| BookingSummary | Card | 예약 요약 (호텔, 객실, 날짜, 가격) |
| CardSelect | Select | 등록 법인카드 선택 (선불업체) |
| RNPLOption | Radio | Reserve Now Pay Later (선불업체) |
| DepositOption | Radio | Floating Deposit 차감 (후불업체) |
| CreditOption | Radio | Credit Line 사용 (후불업체) |
| ContinueButton | Button | 다음 단계 이동 |

**User Actions**:
| Action | Trigger | Result |
|--------|---------|--------|
| 계속 | ContinueButton 클릭 | 필수 필드 검증 → Booking Confirm 이동 |
| 뒤로 | BackButton 클릭 | Hotel Detail 복귀 |

---

### Screen: Booking Confirm (Step 2)

**Purpose**: 최종 예약 확인 및 약관 동의

**Entry Points**: Booking Form 계속 버튼

**Layout**:
```
+--------------------------------------------------+
| [ TopBar ] (공통)                                |
+--------------------------------------------------+
| [ Sidebar ] || [ MainContent ]                   |
|             ||                                   |
|             || [ BookingStepIndicator ]           |
|             ||                                   |
|             || [ ReviewSection ]                 |
|             || - HotelInfo                       |
|             || - DateInfo                        |
|             || - RoomInfo                        |
|             || - GuestInfo                       |
|             ||                                   |
|             || [ PriceDetail ]                   |
|             || - RoomRate                        |
|             || - TaxAmount                       |
|             || - TotalAmount                     |
|             ||                                   |
|             || [ CancelPolicyInfo ]              |
|             ||                                   |
|             || [ TermsCheckbox ]                 |
|             || - Terms & Conditions 동의          |
|             ||                                   |
|             || [ FormActions ]                   |
|             || - BackButton  - ConfirmButton     |
+--------------------------------------------------+
```

**Components**:
| Component | Type | Behavior |
|-----------|------|----------|
| ReviewSection | Section | 예약 정보 요약 (호텔, 날짜, 객실, 게스트) |
| PriceDetail | Table | Room Rate, Tax, Total 상세 |
| CancelPolicyInfo | Info | 취소 정책 안내 |
| TermsCheckbox | Checkbox | 약관 동의 (필수) |
| ConfirmButton | Button | 예약 확정 (약관 동의 시 활성화) |

**User Actions**:
| Action | Trigger | Result |
|--------|---------|--------|
| 약관 동의 | TermsCheckbox 체크 | ConfirmButton 활성화 |
| 예약 확정 | ConfirmButton 클릭 | ELLIS Code 생성 → Booking Complete 이동 |
| 뒤로 | BackButton 클릭 | Booking Form 복귀 |

---

### Screen: Booking Complete (Step 3)

**Purpose**: 예약 성공 화면

**Entry Points**: Booking Confirm 예약 확정

**Layout**:
```
+--------------------------------------------------+
| [ TopBar ] (공통)                                |
+--------------------------------------------------+
| [ Sidebar ] || [ MainContent ]                   |
|             ||                                   |
|             || [ SuccessMessage ]                |
|             || - SuccessIcon                     |
|             || - SuccessText                     |
|             || - ELLISCode                       |
|             ||                                   |
|             || [ BookingDetail ]                 |
|             || - HotelInfo                       |
|             || - DateInfo                        |
|             || - RoomInfo                        |
|             || - GuestInfo                       |
|             || - PaymentInfo                     |
|             ||                                   |
|             || [ ActionButtons ]                 |
|             || - VoucherDownload                 |
|             || - VoucherEmail                    |
|             || - MyBookingsButton                |
|             || - NewBookingButton                |
|             || - RebookButton (취소 시)           |
+--------------------------------------------------+
```

**Components**:
| Component | Type | Behavior |
|-----------|------|----------|
| SuccessIcon | Icon | 체크마크 성공 아이콘 |
| ELLISCode | Display | ELLIS Booking Code 표시 (K+YYMMDD+HHMMSS+H+NN) |
| BookingDetail | Section | 예약 상세 정보 |
| VoucherDownload | Button | 바우처 PDF 다운로드 |
| VoucherEmail | Button | 바우처 이메일 발송 |
| MyBookingsButton | Button | 예약 목록 이동 |
| NewBookingButton | Button | 새 검색 이동 |

**User Actions**:
| Action | Trigger | Result |
|--------|---------|--------|
| 바우처 다운로드 | VoucherDownload 클릭 | PDF 파일 다운로드 |
| 바우처 이메일 | VoucherEmail 클릭 | 게스트 이메일로 발송 |
| 예약 목록 | MyBookingsButton 클릭 | Bookings 페이지 이동 |
| 새 예약 | NewBookingButton 클릭 | Find Hotel 이동 |

---

### Screen: Bookings

**Purpose**: 예약 리스트, 캘린더 뷰, Support Chat (3탭)

**Entry Points**: 사이드바 메뉴 "Bookings"

**Layout**:
```
+--------------------------------------------------+
| [ TopBar ] (공통)                                |
+--------------------------------------------------+
| [ Sidebar ] || [ MainContent ]                   |
|             ||                                   |
|             || [ TabBar ]                        |
|             || - BookingListTab - CalendarTab     |
|             || - SupportChatTab                  |
|             ||                                   |
|             || (Booking List Tab)                |
|             || [ FilterPanel ]                   |
|             || - DateTypeSelect                  |
|             || - DateRangePicker                 |
|             || - ELLISCodeInput                  |
|             || - BookingStatusSelect             |
|             || - PaymentStatusSelect             |
|             || - SearchBySelect + SearchInput    |
|             || - CountrySelect                   |
|             || - HotelNameInput                  |
|             || - SearchBtn  - ResetBtn           |
|             ||                                   |
|             || [ ActionBar ]                     |
|             || - ExcelExportBtn                  |
|             || - BulkVoucherBtn                  |
|             || - PageSizeSelect (20/50/100)      |
|             ||                                   |
|             || [ BookingTable ]                  |
|             || - SelectAllCheckbox               |
|             || - 14 Column Table (반복)           |
|             || - Pagination                      |
|             ||                                   |
|             || (Calendar Tab)                    |
|             || [ CalendarHeader ]                |
|             || - MonthNav (Prev/Today/Next)      |
|             || [ MonthlyStats ]                  |
|             || - Confirmed - Cancelled           |
|             || - RoomNights - NetCost - Unpaid   |
|             || [ CalendarGrid ]                  |
|             || - 7-column grid                   |
|             || - EventBadge (색상별)              |
|             || [ UpcomingCheckins ]              |
|             || - Next 5 check-ins table          |
|             ||                                   |
|             || (Support Chat Tab)                |
|             || [ ChatList ]  || [ ChatArea ]     |
|             || - ChatRoom    || - Messages       |
|             ||   (반복)      || - InputBar       |
|             ||               || - AttachButton   |
+--------------------------------------------------+
```

**Components**:
| Component | Type | Behavior |
|-----------|------|----------|
| TabBar | Tabs | 예약목록 / 캘린더 / 채팅 전환 |
| FilterPanel | Form | 다중 조건 필터 |
| DateTypeSelect | Select | Booking/Cancel/CheckIn/CheckOut/Deadline/Stay |
| BookingStatusSelect | Select | Confirmed/Cancelled/Pending/No-show/Completed |
| PaymentStatusSelect | Select | 6가지 결제 상태 |
| BookingTable | DataTable | 14개 컬럼, 체크박스, 페이지네이션 |
| ExcelExportBtn | Button | .xlsx 내보내기 |
| BulkVoucherBtn | Button | 선택 예약 일괄 바우처 다운로드 |
| CalendarGrid | Calendar | 월별 그리드, 이벤트 색상 배지 |
| MonthlyStats | Card Grid | 월간 통계 5개 카드 |
| UpcomingCheckins | Table | 향후 5건 체크인 (D-day 색상) |
| ChatList | List | 채팅방 목록 |
| ChatArea | Panel | 메시지 영역 + 입력창 |

**User Actions**:
| Action | Trigger | Result |
|--------|---------|--------|
| 탭 전환 | TabBar 클릭 | 해당 탭 콘텐츠 표시 |
| 필터 적용 | SearchBtn 클릭 | 필터 조건으로 검색 |
| 필터 초기화 | ResetBtn 클릭 | 모든 필터 초기화 |
| 예약 상세 | 테이블 행 클릭 | 예약 상세 모달 열기 |
| Excel 내보내기 | ExcelExportBtn 클릭 | .xlsx 파일 다운로드 |
| 일괄 바우처 | BulkVoucherBtn 클릭 | 선택 예약 바우처 다운로드 |
| 캘린더 이벤트 | EventBadge 클릭 | 예약 상세 모달 열기 |
| 채팅 메시지 | 전송 버튼 클릭 | 메시지 발송 |

---

### Screen: Booking Detail Modal

**Purpose**: 예약 전체 정보 조회 (9개 섹션 모달)

**Entry Points**: Bookings 테이블 행 클릭, ELLIS Code 붙여넣기

**Layout**:
```
+------------------------------------------+
| [ ModalHeader ]                          |
| - Title (ELLIS Code)   - CloseButton    |
+------------------------------------------+
| [ BookingSummary ]                       |
| - Status  - BookingDate  - ELLISCode    |
+------------------------------------------+
| [ HotelInfo ]                            |
| - HotelName  - Address  - Contact       |
+------------------------------------------+
| [ RoomDetails ]                          |
| - RoomType  - Guests  - Rate            |
+------------------------------------------+
| [ GuestInfo ]                            |
| - Name  - Email  - Mobile               |
+------------------------------------------+
| [ PaymentInfo ]                          |
| - Amount  - Status  - Method            |
+------------------------------------------+
| [ CancelPolicy ]                         |
| - Deadline  - Fee                        |
+------------------------------------------+
| [ SpecialRequests ]                      |
| - RequestText                            |
+------------------------------------------+
| [ BookingTimeline ]                      |
| - Created  - Confirmed  - Paid          |
+------------------------------------------+
| [ Actions ]                              |
| - VoucherBtn - ReceiptBtn               |
| - CancelBtn  - ModifyBtn                |
+------------------------------------------+
```

**Components**:
| Component | Type | Behavior |
|-----------|------|----------|
| ModalHeader | Header | ELLIS Code 표시 + 닫기 버튼 |
| BookingSummary | Section | 예약 상태, 날짜, 코드 |
| HotelInfo | Section | 호텔명, 주소, 연락처 |
| RoomDetails | Section | 객실 타입, 인원, 요금 |
| GuestInfo | Section | 게스트 정보 |
| PaymentInfo | Section | 결제 금액, 상태, 방법 |
| CancelPolicy | Section | 취소 데드라인, 수수료 |
| BookingTimeline | Timeline | 예약 이벤트 타임라인 |
| VoucherBtn | Button | 바우처 PDF 다운로드 |
| ReceiptBtn | Button | 영수증 PDF 다운로드 |
| CancelBtn | Button | 예약 취소 모달 열기 |

**User Actions**:
| Action | Trigger | Result |
|--------|---------|--------|
| 바우처 다운로드 | VoucherBtn 클릭 | PDF 다운로드 |
| 영수증 다운로드 | ReceiptBtn 클릭 | PDF 다운로드 |
| 예약 취소 | CancelBtn 클릭 | 취소 확인 모달 열기 |
| 닫기 | CloseButton 클릭 | 모달 닫기 |

---

### Screen: Settlement

**Purpose**: 정산 시스템 (5개 탭, Master 전용)

**Entry Points**: 사이드바 메뉴 "Settlement" (Master만 접근)

**Layout**:
```
+--------------------------------------------------+
| [ TopBar ] (공통)                                |
+--------------------------------------------------+
| [ Sidebar ] || [ MainContent ]                   |
|             ||                                   |
|             || [ SettlementTabs ]                |
|             || - Monthly - Invoices - AR          |
|             || - OPPoints - PurchaseByHotel      |
|             ||                                   |
|             || (Monthly Tab)                     |
|             || - MonthSelect                     |
|             || - SummaryCards (Net Cost,          |
|             ||   Room Nights, Avg Net/Night)     |
|             || - DailyDetailTable                |
|             || - ExportButtons (PDF/Excel)        |
|             ||                                   |
|             || (Invoices Tab)                    |
|             || - InvoiceList                     |
|             ||   - Status (Draft/Issued/Paid)    |
|             ||   - Amount (공급가/VAT/합계)       |
|             || - PDFDownload  - EmailSend        |
|             ||                                   |
|             || (AR Tab)                          |
|             || - UnpaidList                      |
|             ||   - CancelDeadline D-day          |
|             || - PayButton  - BulkPayButton      |
|             || - SplitPayOption                  |
|             ||                                   |
|             || (OP Points Tab)                   |
|             || - EarnHistory                     |
|             || - UseHistory                      |
|             || - TransferHistory                 |
|             || - Balance                         |
|             ||                                   |
|             || (Purchase by Hotel Tab)           |
|             || - HotelPurchaseTable              |
|             || - PurchaseChart                   |
|             || - PeriodFilter                    |
+--------------------------------------------------+
```

**Components**:
| Component | Type | Behavior |
|-----------|------|----------|
| SettlementTabs | Tabs | 5개 정산 탭 전환 |
| MonthSelect | Dropdown | 정산 월 선택 |
| SummaryCards | Card Grid | Total Net Cost, Room Nights, Avg Net/Night |
| DailyDetailTable | DataTable | 일별 정산 상세 |
| InvoiceList | DataTable | 인보이스 목록 (상태, 금액) |
| UnpaidList | DataTable | 미결제 건 목록 (D-day 표시) |
| PayButton | Button | 개별 결제 |
| BulkPayButton | Button | 일괄 결제 |
| HotelPurchaseTable | DataTable | 호텔별 구매 분석 |
| PurchaseChart | Chart | 구매 비중 차트 |

**User Actions**:
| Action | Trigger | Result |
|--------|---------|--------|
| 탭 전환 | SettlementTabs 클릭 | 해당 탭 콘텐츠 표시 |
| 월 변경 | MonthSelect 변경 | 해당 월 데이터 로드 |
| 개별 결제 | PayButton 클릭 | 결제 처리 → 상태 변경 |
| 일괄 결제 | BulkPayButton 클릭 | 선택 건 일괄 결제 |
| 인보이스 PDF | PDFDownload 클릭 | PDF 다운로드 |

---

### Screen: Notifications

**Purpose**: 알림 센터

**Entry Points**: 사이드바 메뉴, TopBar NotificationBell

**Layout**:
```
+--------------------------------------------------+
| [ TopBar ] (공통)                                |
+--------------------------------------------------+
| [ Sidebar ] || [ MainContent ]                   |
|             ||                                   |
|             || [ SummaryCards ]                  |
|             || - Critical - Unread               |
|             || - Deadlines - Payments            |
|             ||                                   |
|             || [ NotificationTabs ]              |
|             || - All - Unread - Deadlines        |
|             || - Payment - CheckIn - Bookings    |
|             || - Cancelled - System              |
|             ||                                   |
|             || [ MarkAllReadButton ]             |
|             ||                                   |
|             || [ NotificationList ]              |
|             || - NotificationItem (반복)          |
|             ||   - PriorityBadge                 |
|             ||   - Icon  - Title  - Desc         |
|             ||   - Time  - ReadStatus            |
|             ||                                   |
|             || [ NotificationSettings ]          |
|             || - SettingsToggle (반복)            |
+--------------------------------------------------+
```

**Components**:
| Component | Type | Behavior |
|-----------|------|----------|
| SummaryCards | Card Grid | Critical/Unread/Deadlines/Payments 건수 |
| NotificationTabs | Tabs | 8개 카테고리 필터 |
| MarkAllReadButton | Button | 전체 읽음 처리 |
| NotificationItem | ListItem | 우선순위 배지, 제목, 설명, 시간, 읽음 상태 |
| PriorityBadge | Badge | Critical(빨강)/High(노랑)/Medium(초록)/Low(회색) |
| NotificationSettings | Form | 알림 수신 토글 목록 |

**User Actions**:
| Action | Trigger | Result |
|--------|---------|--------|
| 알림 클릭 | NotificationItem 클릭 | 관련 페이지 이동 + 읽음 처리 |
| 전체 읽음 | MarkAllReadButton 클릭 | 모든 알림 읽음 처리 |
| 탭 전환 | NotificationTabs 클릭 | 카테고리별 필터링 |
| 설정 변경 | SettingsToggle 변경 | 알림 수신 설정 즉시 반영 |

---

### Screen: FAQ Board

**Purpose**: 자주 묻는 질문 조회

**Entry Points**: 사이드바 메뉴 "FAQ Board"

**Layout**:
```
+--------------------------------------------------+
| [ TopBar ] (공통)                                |
+--------------------------------------------------+
| [ Sidebar ] || [ MainContent ]                   |
|             ||                                   |
|             || [ SearchBar ]                     |
|             || - SearchInput                     |
|             ||                                   |
|             || [ CategoryTabs ]                  |
|             || - All - Booking - Payment          |
|             || - Cancellation - Account           |
|             || - Technical                        |
|             ||                                   |
|             || [ FAQList ]                       |
|             || - FAQItem (반복, 아코디언)          |
|             ||   - QuestionTitle                 |
|             ||   - AnswerContent (펼침)           |
+--------------------------------------------------+
```

**Components**:
| Component | Type | Behavior |
|-----------|------|----------|
| SearchInput | Input | 키워드 검색 (제목+내용) |
| CategoryTabs | Tabs | 6개 카테고리 필터 |
| FAQItem | Accordion | 질문 클릭 시 답변 펼침/접기 |

**User Actions**:
| Action | Trigger | Result |
|--------|---------|--------|
| 검색 | SearchInput 입력 | 실시간 검색 결과 필터링 |
| 카테고리 전환 | CategoryTabs 클릭 | 해당 카테고리 FAQ만 표시 |
| FAQ 펼침 | QuestionTitle 클릭 | 답변 아코디언 토글 |

---

### Screen: My Account

**Purpose**: 사용자/업체 정보 관리

**Entry Points**: 사이드바 메뉴 "My Account", TopBar Profile

**Layout**:
```
+--------------------------------------------------+
| [ TopBar ] (공통)                                |
+--------------------------------------------------+
| [ Sidebar ] || [ MainContent ]                   |
|             ||                                   |
|             || [ PersonalInfo ]                  |
|             || - NameInput  - EmailDisplay        |
|             || - PhoneInput  - PasswordChange    |
|             ||                                   |
|             || [ CompanyInfo ]                   |
|             || - CompanyName  - BusinessType     |
|             || - ContractDate                    |
|             ||                                   |
|             || [ PaymentInfo ]                   |
|             || (선불업체)                         |
|             || - CardList                        |
|             || - DefaultCardSetting              |
|             || - AddCardButton                   |
|             || (후불업체)                         |
|             || - DepositBalance                  |
|             || - CreditLineLimit                 |
|             ||                                   |
|             || [ OPManagement ] (Master 전용)    |
|             || - OPTable                         |
|             ||   - Name - Email - Status - Share |
|             || - AddOPButton                     |
|             || - EditOPButton  - DeactivateBtn   |
|             ||                                   |
|             || [ SaveButton ]                    |
+--------------------------------------------------+
```

**Components**:
| Component | Type | Behavior |
|-----------|------|----------|
| PersonalInfo | Form | 이름, 연락처, 비밀번호 변경 |
| CompanyInfo | Display | 업체 정보 (읽기전용) |
| CardList | List | 등록 법인카드 목록 (선불업체) |
| DepositBalance | Display | Floating Deposit 잔액 (후불업체) |
| CreditLineLimit | Display | Credit Line 한도 (후불업체) |
| OPTable | DataTable | OP 목록 (Master 전용) |
| AddOPButton | Button | OP 계정 추가 |

**User Actions**:
| Action | Trigger | Result |
|--------|---------|--------|
| 정보 저장 | SaveButton 클릭 | 변경사항 즉시 반영 |
| 카드 추가 | AddCardButton 클릭 | 카드 등록 모달 |
| OP 추가 | AddOPButton 클릭 | OP 생성 모달 |
| OP 비활성화 | DeactivateBtn 클릭 | OP 계정 비활성화 확인 |

---

### Screen: Rewards Mall

**Purpose**: OP Points로 상품 교환

**Entry Points**: 사이드바 메뉴 "Rewards Mall", Dashboard OP Points Widget 링크

**Layout**:
```
+--------------------------------------------------+
| [ TopBar ] (공통)                                |
+--------------------------------------------------+
| [ Sidebar ] || [ MainContent ]                   |
|             ||                                   |
|             || [ PointsBalance ]                 |
|             || - CurrentPoints  - UsedThisMonth  |
|             ||                                   |
|             || [ CategoryTabs ]                  |
|             || - All - GiftCards - Travel         |
|             || - Electronics - Lifestyle          |
|             || - Dining - Entertainment           |
|             ||                                   |
|             || [ ProductGrid ]                   |
|             || - ProductCard (반복)               |
|             ||   - ProductImage                  |
|             ||   - ProductName                   |
|             ||   - PointsCost                    |
|             ||   - RedeemButton                  |
|             ||                                   |
|             || [ PointsHistory ]                 |
|             || - HistoryTable                    |
|             || - PeriodFilter                    |
|             ||                                   |
|             || [ PointsTransfer ]                |
|             || - TargetOPSelect                  |
|             || - AmountInput                     |
|             || - ReasonInput                     |
|             || - TransferButton                  |
+--------------------------------------------------+
```

**Components**:
| Component | Type | Behavior |
|-----------|------|----------|
| PointsBalance | Card | 현재 잔액, 이번 달 사용량 |
| CategoryTabs | Tabs | 7개 상품 카테고리 |
| ProductCard | Card | 상품 이미지, 이름, 포인트 가격, 교환 버튼 |
| RedeemButton | Button | 상품 교환 (잔액 확인) |
| HistoryTable | DataTable | 적립/사용/이전 내역 |
| TargetOPSelect | Select | 같은 업체 내 OP 선택 |
| TransferButton | Button | 포인트 이전 실행 |

**User Actions**:
| Action | Trigger | Result |
|--------|---------|--------|
| 상품 교환 | RedeemButton 클릭 | 잔액 확인 → 교환 확인 모달 → 잔액 차감 |
| 카테고리 전환 | CategoryTabs 클릭 | 해당 카테고리 상품만 표시 |
| 포인트 이전 | TransferButton 클릭 | 확인 모달 → 이전 실행 |

---

### Screen: AI Assistant (플로팅 위젯)

**Purpose**: AI 기반 호텔 추천, 예약 분석, 지역 가이드 (모든 화면에서 접근)

**Entry Points**: 화면 우하단 플로팅 버튼 클릭

**Layout**:
```
+----------------------------------+
| [ ChatHeader ]                   |
| - Title (AI Assistant)           |
| - MinimizeButton - CloseButton   |
+----------------------------------+
| [ QuickActions ]                 |
| - HotelRecommendBtn             |
| - BookingAnalysisBtn             |
| - AreaGuideBtn                   |
| - HelpBtn                        |
+----------------------------------+
| [ ChatMessages ]                 |
| - UserMessage (반복)             |
| - AIMessage (반복)               |
|   - TextResponse                 |
|   - HotelCard (클릭 가능)        |
|   - AnalysisChart                |
+----------------------------------+
| [ ChatInput ]                    |
| - MessageInput   - SendButton    |
+----------------------------------+
```

**Components**:
| Component | Type | Behavior |
|-----------|------|----------|
| FloatingButton | FAB | 화면 우하단 고정, 클릭 시 위젯 열기 |
| ChatHeader | Header | 제목, 최소화/닫기 버튼 |
| QuickActions | ButtonGroup | 4개 빠른 실행 버튼 |
| ChatMessages | ScrollArea | 메시지 히스토리 |
| HotelCard | Card | 클릭 가능한 호텔 카드 (이름, 평점, 가격) |
| MessageInput | Input | 자연어 입력 |
| SendButton | Button | 메시지 전송 |

**User Actions**:
| Action | Trigger | Result |
|--------|---------|--------|
| 위젯 열기 | FloatingButton 클릭 | AI 채팅 위젯 표시 |
| Quick Action | QuickAction 버튼 클릭 | 해당 프롬프트 자동 입력 + 전송 |
| 메시지 전송 | SendButton 클릭 | Claude API 호출 → AI 응답 표시 |
| 호텔 카드 클릭 | HotelCard 클릭 | Hotel Detail 페이지 이동 |
| 최소화 | MinimizeButton 클릭 | FloatingButton으로 축소 |

---

## 5. Error Handling

| Error Code | Condition | User Message | Resolution |
|------------|-----------|--------------|------------|
| ERR-AUTH-001 | 잘못된 이메일/비밀번호 | "이메일 또는 비밀번호가 올바르지 않습니다" | 재입력 유도 |
| ERR-AUTH-002 | Pending 상태 계정 로그인 | "계정 승인 대기 중입니다. 관리자에게 문의하세요" | 내부 승인 프로세스 안내 |
| ERR-AUTH-003 | 비활성화된 계정 로그인 | "비활성화된 계정입니다. 관리자에게 문의하세요" | Master에게 연락 |
| ERR-AUTH-004 | 세션 타임아웃 (30분) | "세션이 만료되었습니다. 다시 로그인해 주세요" | Login 화면 리다이렉트 |
| ERR-SEARCH-001 | 검색 결과 없음 | "조건에 맞는 호텔이 없습니다. 검색 조건을 변경해 보세요" | 필터 조건 완화 안내 |
| ERR-SEARCH-002 | 필수 검색 조건 미입력 | "목적지와 날짜를 입력해 주세요" | 필수 필드 하이라이트 |
| ERR-BOOK-001 | 필수 게스트 정보 미입력 | "필수 항목을 모두 입력해 주세요" | 미입력 필드 하이라이트 |
| ERR-BOOK-002 | 객실 가용성 없음 | "선택한 객실이 더 이상 이용 가능하지 않습니다" | 다른 객실 선택 유도 |
| ERR-BOOK-003 | Non-Refundable 예약 취소 시도 | "Non-Refundable 예약입니다. 취소 시 100% 수수료가 부과됩니다. 그래도 취소하시겠습니까?" | 경고 모달 표시 → 확인 시 취소 진행, 취소 시 복귀 |
| ERR-PAY-001 | 법인카드 결제 실패 | "결제에 실패했습니다. 카드 정보를 확인해 주세요" | 다른 카드 선택 또는 재시도 |
| ERR-PAY-002 | Floating Deposit 잔액 부족 | "잔액이 부족합니다. 현재 잔액: ${amount}" | Credit Line 사용 또는 입금 안내 |
| ERR-PAY-003 | Credit Line 한도 초과 | "신용한도를 초과했습니다. 한도: ${limit}" | 한도 증액 요청 안내 |
| ERR-PAY-004 | Low Deposit 경고 | "보증금 잔액이 $5,000 미만입니다" | 입금 안내 (Critical 알림) |
| ERR-AI-001 | Claude API 연결 실패 | "AI 서비스에 일시적으로 연결할 수 없습니다" | Local Fallback 모드 전환 |
| ERR-AI-002 | API 응답 타임아웃 (5초) | "응답 시간이 초과되었습니다. 다시 시도해 주세요" | 재시도 버튼 |
| ERR-REG-001 | 중복 이메일 | "이미 등록된 이메일입니다" | 로그인 또는 다른 이메일 사용 |
| ERR-REG-002 | 비밀번호 강도 미달 | "비밀번호는 8자 이상, 영문+숫자+특수문자를 포함해야 합니다" | 비밀번호 재입력 |
| ERR-PTS-001 | 포인트 잔액 부족 | "포인트가 부족합니다. 현재 잔액: ${points}P" | 잔액 확인 |
| ERR-PTS-002 | 같은 업체 외 OP에게 이전 시도 | "같은 업체 내 OP에게만 이전 가능합니다" | 대상 재선택 |
| ERR-PAY-005 | Deposit + Credit Line 모두 부족 | "잔액과 신용한도가 모두 부족합니다" | 입금 또는 한도 증액 요청 |
| ERR-AUTH-005 | 계정 잠금 (5회 연속 로그인 실패) | "계정이 잠겼습니다. 30분 후 다시 시도하거나 관리자에게 문의하세요" | 30분 대기 또는 Master 수동 해제 |
| ERR-AUTH-006 | 비밀번호 재설정 - 미등록 이메일 | "입력하신 이메일로 재설정 안내를 발송했습니다" | 보안상 등록 여부 미공개, 동일 메시지 |
| ERR-STORAGE-001 | LocalStorage 쓰기 실패 (5MB 초과) | "저장 공간이 부족합니다. 오래된 데이터를 정리해 주세요" | 오래된 캐시 데이터 자동 정리 시도 |
| ERR-DOC-001 | 이메일 발송 실패 (Mock) | "이메일 발송에 실패했습니다. 다시 시도해 주세요" | 재시도 |
| ERR-SEARCH-003 | 과거 날짜 체크인 선택 | "체크인 날짜는 오늘 이후여야 합니다" | 날짜 재선택 |
| ERR-SEARCH-004 | 체크아웃이 체크인보다 빠름 | "체크아웃 날짜는 체크인 이후여야 합니다" | 날짜 재선택 |
| ERR-GENERAL-001 | 네트워크 오류 | "네트워크 연결을 확인해 주세요" | 연결 확인 후 재시도 |
