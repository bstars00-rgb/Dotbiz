/**
 * 결정 #2 — Dispute ↔ Ticket 양방향 연결 검증
 *
 * 분쟁은 Settlement에서 제기 → Ticket 자동 생성 → Tickets에서 해결 →
 * 종결 시 dispute 상태 자동 동기화 (Completed → Accepted, Rejected → Rejected).
 */
import { describe, it, expect } from "vitest";
import { tickets } from "@/mocks/tickets";
import { invoiceDisputes } from "@/mocks/settlement";

describe("결정 #2 — Dispute / Ticket 연결", () => {
  it("Invoice Dispute 타입 ticket이 시드에 존재", () => {
    const disputeTickets = tickets.filter(t => t.ticketType === "Invoice Dispute");
    expect(disputeTickets.length).toBeGreaterThanOrEqual(2);
    disputeTickets.forEach(t => {
      expect(t.linkedDisputeId).toBeTruthy();
      expect(t.linkedInvoiceNo).toBeTruthy();
    });
  });

  it("각 dispute의 ticketId가 실제 ticket과 매칭", () => {
    const disputesWithTickets = invoiceDisputes.filter(d => d.ticketId);
    disputesWithTickets.forEach(d => {
      const matchedTicket = tickets.find(t => t.id === d.ticketId);
      expect(matchedTicket).toBeDefined();
      expect(matchedTicket?.linkedDisputeId).toBe(d.id);
    });
  });

  it("Resolved dispute(disp-002)는 ticket Completed 상태와 정합", () => {
    const dispute = invoiceDisputes.find(d => d.id === "disp-002");
    const ticket = tickets.find(t => t.linkedDisputeId === "disp-002");
    expect(dispute?.status).toBe("Accepted");
    expect(ticket?.status).toBe("Completed");
  });

  it("UnderReview dispute(disp-001)는 ticket Processing 상태와 정합", () => {
    const dispute = invoiceDisputes.find(d => d.id === "disp-001");
    const ticket = tickets.find(t => t.linkedDisputeId === "disp-001");
    expect(dispute?.status).toBe("UnderReview");
    expect(ticket?.status).toBe("Processing");
  });

  it("ticketType union에 Invoice Dispute 포함", () => {
    const sample = tickets.find(t => t.ticketType === "Invoice Dispute");
    expect(sample).toBeDefined();
  });
});
