/**
 * Notifications 점검 — 라우팅 정책 검증
 *
 * 정책:
 *   • Master: 자기 회사 모든 알림
 *   • OP / Accounting: 본인 발행 티켓·분쟁 알림만
 *   • EllisOP: 본인 assignee 티켓
 *   • EllisAdmin: CMS 변경 알림만
 *   • 사용자 설정 권한 X — 시스템 지정
 */
import { describe, it, expect } from "vitest";
import { isAlertForUser, isInQuietHours, isQuietMuted, groupAlerts } from "@/lib/alertRouting";
import type { Alert } from "@/mocks/alerts";
import type { Ticket } from "@/mocks/tickets";
import type { InvoiceDispute } from "@/mocks/settlement";

const masterUser = { email: "master@dotbiz.com", role: "Master", company: "TravelCo International" };
const opUser = { email: "op@dotbiz.com", role: "OP", company: "TravelCo International" };
const accountingUser = { email: "accounting@dotbiz.com", role: "Accounting", company: "TravelCo International" };
const ellisOp = { email: "cs@ohmyhotel.com", role: "EllisOP", company: "OhMyHotel Inc.", isInternal: true };
const ellisAdmin = { email: "ellis@ohmyhotel.com", role: "EllisAdmin", company: "OhMyHotel Inc.", isInternal: true };

const baseAlert: Alert = {
  id: "test", type: "invoice_due_soon", category: "Settlement", priority: "P1",
  customerCompanyId: "comp-001",
  title: "test", body: "test",
  sentVia: ["In-app"], createdAt: "2026-04-30 10:00:00",
};

const opTicket: Ticket = {
  id: "TKT-X", ticketType: "Special Request",
  bookingId: "bk-001", hotelName: "X", guestName: "X",
  status: "Pending", priority: "Medium",
  createdAt: "2026-04-30 09:00", updatedAt: "2026-04-30 09:00",
  estimatedCompletion: "2026-05-02",
  description: "test", assignee: "cs@ohmyhotel.com",
  traces: [{ date: "2026-04-30 09:00", action: "Created", by: "op@dotbiz.com", note: "" }],
};

const opDispute: InvoiceDispute = {
  id: "disp-X", invoiceNo: "INV-X",
  customerCompanyId: "comp-001", raisedBy: "accounting@dotbiz.com",
  raisedAt: "2026-04-30", reason: "AmountMismatch",
  description: "test", affectedBookingIds: [], disputedAmount: 100,
  status: "Open",
};

describe("isAlertForUser — Master", () => {
  it("Master는 자기 회사 모든 알림 수신", () => {
    expect(isAlertForUser(baseAlert, masterUser)).toBe(true);
  });
  it("Master는 다른 회사 알림 X", () => {
    expect(isAlertForUser({ ...baseAlert, customerCompanyId: "comp-002" }, masterUser)).toBe(false);
  });
});

describe("isAlertForUser — OP", () => {
  it("OP는 본인이 발행한 티켓 알림 수신", () => {
    const alert = { ...baseAlert, refType: "ticket" as const, refId: "TKT-X" };
    expect(isAlertForUser(alert, opUser, [opTicket])).toBe(true);
  });
  it("OP는 다른 사용자가 발행한 티켓 알림 X", () => {
    const alert = { ...baseAlert, refType: "ticket" as const, refId: "TKT-X" };
    const otherTicket = { ...opTicket, traces: [{ ...opTicket.traces[0], by: "someone-else@dotbiz.com" }] };
    expect(isAlertForUser(alert, opUser, [otherTicket])).toBe(false);
  });
  it("OP는 Booking category 알림 수신 (예약 데드라인 등)", () => {
    const alert = { ...baseAlert, category: "Booking" as const };
    expect(isAlertForUser(alert, opUser, [])).toBe(true);
  });
  it("OP는 일반 Settlement 알림 X (Master만)", () => {
    expect(isAlertForUser(baseAlert, opUser, [])).toBe(false);
  });
});

describe("isAlertForUser — Accounting", () => {
  it("Accounting은 본인이 발행한 invoice 분쟁 알림 수신", () => {
    const alert = { ...baseAlert, type: "dispute_opened" as const, refType: "invoice" as const, refId: "INV-X" };
    expect(isAlertForUser(alert, accountingUser, [], [opDispute])).toBe(true);
  });
  it("Accounting은 다른 사람이 발행한 분쟁 알림 X", () => {
    const otherDispute = { ...opDispute, raisedBy: "someone-else@dotbiz.com" };
    const alert = { ...baseAlert, type: "dispute_opened" as const, refType: "invoice" as const, refId: "INV-X" };
    expect(isAlertForUser(alert, accountingUser, [], [otherDispute])).toBe(false);
  });
  it("Accounting은 일반 Settlement 알림 X (분쟁 외)", () => {
    expect(isAlertForUser(baseAlert, accountingUser, [], [])).toBe(false);
  });
});

describe("isAlertForUser — ELLIS 직원", () => {
  it("EllisOP는 본인 assignee 티켓 알림만", () => {
    const alert = { ...baseAlert, refType: "ticket" as const, refId: "TKT-X" };
    expect(isAlertForUser(alert, ellisOp, [opTicket])).toBe(true);
  });
  it("EllisOP는 자기 assignee 아닌 티켓 X", () => {
    const otherTicket = { ...opTicket, assignee: "different@ohmyhotel.com" };
    const alert = { ...baseAlert, refType: "ticket" as const, refId: "TKT-X" };
    expect(isAlertForUser(alert, ellisOp, [otherTicket])).toBe(false);
  });
  it("EllisAdmin은 CMS 변경 알림만 (contract_amendment 등)", () => {
    const cmsAlert = { ...baseAlert, type: "contract_amendment" as const };
    expect(isAlertForUser(cmsAlert, ellisAdmin)).toBe(true);
  });
  it("EllisAdmin은 일반 알림 X", () => {
    expect(isAlertForUser(baseAlert, ellisAdmin)).toBe(false);
  });
});

describe("Quiet hours", () => {
  it("22:00–08:00 사이는 quiet hours", () => {
    expect(isInQuietHours(new Date("2026-04-30T23:30:00"))).toBe(true);
    expect(isInQuietHours(new Date("2026-04-30T05:30:00"))).toBe(true);
  });
  it("08:00–22:00 사이는 활성 시간", () => {
    expect(isInQuietHours(new Date("2026-04-30T10:00:00"))).toBe(false);
    expect(isInQuietHours(new Date("2026-04-30T20:00:00"))).toBe(false);
  });
  it("quiet hours에 P0는 우회, P1/P2는 mute", () => {
    const night = new Date("2026-04-30T23:30:00");
    expect(isQuietMuted({ ...baseAlert, priority: "P0" }, night)).toBe(false);
    expect(isQuietMuted({ ...baseAlert, priority: "P1" }, night)).toBe(true);
    expect(isQuietMuted({ ...baseAlert, priority: "P2" }, night)).toBe(true);
  });
});

describe("Alert grouping", () => {
  it("같은 type+refType+refId는 그룹 1개", () => {
    const a1 = { ...baseAlert, id: "a1", createdAt: "2026-04-30 10:00:00", refType: "invoice" as const, refId: "INV-1" };
    const a2 = { ...baseAlert, id: "a2", createdAt: "2026-04-30 11:00:00", refType: "invoice" as const, refId: "INV-1" };
    const a3 = { ...baseAlert, id: "a3", createdAt: "2026-04-30 12:00:00", refType: "invoice" as const, refId: "INV-2" };
    const groups = groupAlerts([a1, a2, a3]);
    expect(groups.length).toBe(2);
    const inv1Group = groups.find(g => g.primary.refId === "INV-1");
    expect(inv1Group?.totalCount).toBe(2);
    expect(inv1Group?.primary.id).toBe("a2"); // 최신
  });
});
