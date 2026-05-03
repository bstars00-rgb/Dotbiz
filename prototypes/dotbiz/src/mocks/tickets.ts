export interface Ticket {
  id: string;
  ticketType: "Cancellation Request" | "Date Change" | "Room Change" | "Special Request" | "Complaint" | "Refund Request" | "Invoice Dispute";
  bookingId: string;
  hotelName: string;
  guestName: string;
  status: "Pending" | "Processing" | "Completed" | "Rejected";
  priority: "High" | "Medium" | "Low";
  createdAt: string;
  updatedAt: string;
  estimatedCompletion: string;
  description: string;
  assignee: string;
  traces: { date: string; action: string; by: string; note: string }[];
  /** 분쟁 연동 (2026-04-30 결정 #2) — 이 티켓이 어떤 invoiceDispute에서 시작됐는지.
   * 티켓 종결 시 dispute 상태도 자동 동기화. */
  linkedDisputeId?: string;
  /** 분쟁 티켓의 추가 컨텍스트 — Invoice / 예약 ID는 booking과 별개 */
  linkedInvoiceNo?: string;
}

export const tickets: Ticket[] = [
  { id: "TK-2026-001", ticketType: "Cancellation Request", bookingId: "ELS-2026-00231", hotelName: "Park Hyatt Busan", guestName: "Emma Lee", status: "Completed", priority: "High", createdAt: "2026-04-06 09:30", updatedAt: "2026-04-07 14:20", estimatedCompletion: "2026-04-07", description: "Guest requests cancellation due to flight cancellation. Already past free cancel deadline.", assignee: "Sarah Kim", traces: [
    { date: "2026-04-06 09:30", action: "Ticket Created", by: "Emma Lee (Auto)", note: "Cancellation request submitted via booking page" },
    { date: "2026-04-06 10:15", action: "Assigned", by: "System", note: "Assigned to Sarah Kim" },
    { date: "2026-04-06 14:00", action: "Hotel Contacted", by: "Sarah Kim", note: "Contacted Park Hyatt Busan reservation desk. Hotel agreed to partial refund." },
    { date: "2026-04-07 14:20", action: "Completed", by: "Sarah Kim", note: "Partial refund of $260 processed. Booking cancelled." },
  ]},
  { id: "TK-2026-002", ticketType: "Date Change", bookingId: "ELS-2026-00240", hotelName: "Raffles Singapore", guestName: "Michael Tan", status: "Processing", priority: "Medium", createdAt: "2026-04-08 11:00", updatedAt: "2026-04-09 09:00", estimatedCompletion: "2026-04-10", description: "Guest wants to change check-in from Apr 28 to May 2. Same room type requested.", assignee: "Michael Lee", traces: [
    { date: "2026-04-08 11:00", action: "Ticket Created", by: "Michael Lee", note: "Date change request for Raffles Singapore" },
    { date: "2026-04-08 11:30", action: "Hotel Contacted", by: "Michael Lee", note: "Sent modification request to Raffles reservation team" },
    { date: "2026-04-09 09:00", action: "Awaiting Response", by: "Michael Lee", note: "Hotel acknowledges request, checking availability for May 2" },
  ]},
  { id: "TK-2026-003", ticketType: "Special Request", bookingId: "ELS-2026-00212", hotelName: "Four Seasons Bali at Sayan", guestName: "Sarah Kim", status: "Completed", priority: "Low", createdAt: "2026-04-03 15:00", updatedAt: "2026-04-04 10:30", estimatedCompletion: "2026-04-04", description: "Honeymoon decoration setup in room upon arrival. Red roses, champagne, and a cake.", assignee: "Nguyen Mai", traces: [
    { date: "2026-04-03 15:00", action: "Ticket Created", by: "Sarah Kim", note: "Honeymoon setup request" },
    { date: "2026-04-03 16:00", action: "Hotel Contacted", by: "Nguyen Mai", note: "Sent special arrangement request to Four Seasons concierge" },
    { date: "2026-04-04 10:30", action: "Completed", by: "Nguyen Mai", note: "Hotel confirmed honeymoon setup. Additional charge $150 added to folio." },
  ]},
  { id: "TK-2026-004", ticketType: "Refund Request", bookingId: "ELS-2026-00225", hotelName: "InterContinental Da Nang", guestName: "Tom Wilson", status: "Pending", priority: "High", createdAt: "2026-04-10 08:00", updatedAt: "2026-04-10 08:00", estimatedCompletion: "2026-04-12", description: "Guest was no-show due to medical emergency. Requests full refund with medical certificate.", assignee: "", traces: [
    { date: "2026-04-10 08:00", action: "Ticket Created", by: "Tom Wilson (Auto)", note: "No-show refund request with medical documentation" },
  ]},
  { id: "TK-2026-005", ticketType: "Room Change", bookingId: "ELS-2026-00142", hotelName: "Grand Hyatt Seoul", guestName: "John Smith", status: "Completed", priority: "Medium", createdAt: "2026-03-25 13:00", updatedAt: "2026-03-26 11:00", estimatedCompletion: "2026-03-26", description: "Upgrade from Deluxe King to Grand Suite if available at same rate.", assignee: "David Park", traces: [
    { date: "2026-03-25 13:00", action: "Ticket Created", by: "Sarah Kim", note: "Room upgrade request for VIP guest" },
    { date: "2026-03-25 14:30", action: "Hotel Contacted", by: "David Park", note: "Contacted Grand Hyatt front desk manager" },
    { date: "2026-03-26 11:00", action: "Completed", by: "David Park", note: "Upgrade confirmed at discounted rate (+$120/night). Guest notified." },
  ]},
  { id: "TK-2026-006", ticketType: "Complaint", bookingId: "ELS-2026-00191", hotelName: "Marina Bay Sands", guestName: "Lee Wei Ming", status: "Processing", priority: "High", createdAt: "2026-04-09 16:00", updatedAt: "2026-04-10 10:00", estimatedCompletion: "2026-04-11", description: "Guest complains about room not matching description. Requested pool view but received city view.", assignee: "Emily Chen", traces: [
    { date: "2026-04-09 16:00", action: "Ticket Created", by: "Lee Wei Ming", note: "Room mismatch complaint" },
    { date: "2026-04-09 17:00", action: "Assigned", by: "System", note: "High priority - assigned to Emily Chen" },
    { date: "2026-04-10 10:00", action: "Hotel Contacted", by: "Emily Chen", note: "Escalated to MBS guest relations. Awaiting room change or compensation offer." },
  ]},
  { id: "TK-2026-007", ticketType: "Cancellation Request", bookingId: "ELS-2026-00205", hotelName: "Park Hyatt Saigon", guestName: "David Park", status: "Pending", priority: "Medium", createdAt: "2026-04-11 09:00", updatedAt: "2026-04-11 09:00", estimatedCompletion: "2026-04-13", description: "Client cancelled trip. Within free cancellation period.", assignee: "", traces: [
    { date: "2026-04-11 09:00", action: "Ticket Created", by: "David Park", note: "Free cancellation request" },
  ]},
  { id: "TK-2026-008", ticketType: "Cancellation Request", bookingId: "ELS-2026-00248", hotelName: "Novotel Shanghai Pudong", guestName: "Zhang Wei", status: "Rejected", priority: "Low", createdAt: "2026-04-08 14:00", updatedAt: "2026-04-09 16:00", estimatedCompletion: "2026-04-09", description: "Post-checkout cancellation attempt. Stay already completed.", assignee: "Emily Chen", traces: [
    { date: "2026-04-08 14:00", action: "Ticket Created", by: "Zhang Wei", note: "Cancellation request after checkout" },
    { date: "2026-04-08 15:00", action: "Reviewed", by: "Emily Chen", note: "Stay already completed on Apr 8. Cannot cancel post-checkout." },
    { date: "2026-04-09 16:00", action: "Rejected", by: "Emily Chen", note: "Request rejected - stay completed. Guest informed." },
  ]},
  /* ── Invoice Dispute 티켓 (Settlement Disputes에서 자동 생성) ── */
  {
    id: "TKT-2026-0421",
    ticketType: "Invoice Dispute",
    bookingId: "bk-001",
    hotelName: "Grand Hyatt Seoul",
    guestName: "TravelCo Accounting",
    status: "Processing",
    priority: "Medium",
    createdAt: "2026-04-22 10:30",
    updatedAt: "2026-04-23 09:00",
    estimatedCompletion: "2026-04-25",
    description: "Invoice INV-2026-0089 — Grand Hyatt Seoul 예약 금액이 계약 단가 대비 $40 초과 청구됨. 사유: AmountMismatch.",
    assignee: "cs@ohmyhotel.com",   /* EllisOP 라우팅 — 데모용 */
    linkedDisputeId: "disp-001",
    linkedInvoiceNo: "INV-2026-0089",
    traces: [
      { date: "2026-04-22 10:30", action: "Ticket Created (Auto)", by: "accounting@dotbiz.com", note: "Invoice 분쟁 자동 라우팅 — disp-001" },
      { date: "2026-04-22 14:00", action: "Assigned", by: "System", note: "ELLIS Settlement팀 Sarah Kim에게 배정" },
      { date: "2026-04-23 09:00", action: "Hotel Contract Review", by: "Sarah Kim", note: "Grand Hyatt Seoul 계약 단가 확인 중. 호텔 측에 단가 검증 요청 송부." },
    ],
  },
  {
    id: "TKT-2026-0325",
    ticketType: "Invoice Dispute",
    bookingId: "bk-004",
    hotelName: "ANA Crowne Plaza Osaka",
    guestName: "TravelCo Accounting",
    status: "Completed",
    priority: "Low",
    createdAt: "2026-03-25 11:15",
    updatedAt: "2026-04-02 16:30",
    estimatedCompletion: "2026-04-02",
    description: "Invoice INV-2026-0067 — ANA Osaka 예약 취소 후 cancellation fee 처리는 됐으나 조정 라인 누락. 사유: AdjustmentMissing.",
    assignee: "David Park",
    linkedDisputeId: "disp-002",
    linkedInvoiceNo: "INV-2026-0067",
    traces: [
      { date: "2026-03-25 11:15", action: "Ticket Created (Auto)", by: "accounting@dotbiz.com", note: "Invoice 분쟁 자동 라우팅 — disp-002" },
      { date: "2026-03-26 09:00", action: "Investigation", by: "David Park", note: "billingDetails 조회 결과 BILL-2026-0010(-$45)이 INV-2026-0089에 추가됨 확인" },
      { date: "2026-04-02 16:30", action: "Resolved · Accepted", by: "David Park", note: "분쟁 인정. -$65 adjustment 라인 다음 invoice(INV-2026-0089)에 BILL-2026-0010으로 반영됨. dispute 상태 Accepted 자동 동기화." },
    ],
  },
];
