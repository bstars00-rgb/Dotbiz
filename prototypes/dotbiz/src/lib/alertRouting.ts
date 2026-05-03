/**
 * Alert Routing — 2026-04-30 결정 (Notifications 점검)
 *
 * 정책 (시스템이 처음부터 지정 — 사용자 설정 권한 없음):
 *   • Master: 자기 회사의 모든 알림 받음
 *   • OP: 자기가 발행한 티켓 알림만 + 본인 개인 알림 (points/account)
 *   • Accounting: 자기가 발행한 invoice 분쟁 알림만 + 본인 개인 알림
 *   • EllisOP (ELLIS): 본인이 assignee인 티켓의 알림만
 *   • EllisAdmin (ELLIS): 시스템 정책 변경 알림만 (CMS-related)
 *
 * Quiet hours (22:00–08:00): P0 외에는 묶여서 표시 (실제로는 발송 보류).
 * 동일 type+refId는 UI에서 그룹핑 (최신만 표시).
 */
import type { Alert } from "@/mocks/alerts";
import type { Ticket } from "@/mocks/tickets";
import type { InvoiceDispute } from "@/mocks/settlement";
import { companies } from "@/mocks/companies";

export interface RoutingUser {
  email: string;
  role: string;
  company: string;          /* User.company는 회사 name */
  isInternal?: boolean;
}

/** 사용자의 customerCompanyId 조회 (company name → id) */
export function userCompanyId(user: RoutingUser | null | undefined): string | null {
  if (!user) return null;
  return companies.find(c => c.name === user.company)?.id || null;
}

/**
 * 알림 1건이 사용자에게 전달되어야 하는지 판단.
 *
 * @param alert - 검사할 alert
 * @param user - 현재 로그인 사용자
 * @param tickets - 티켓 목록 (refType=ticket일 때 발행자 lookup)
 * @param disputes - 분쟁 목록 (refType=invoice + dispute 자동 티켓일 때 lookup)
 */
export function isAlertForUser(
  alert: Alert,
  user: RoutingUser | null | undefined,
  tickets: Ticket[] = [],
  disputes: InvoiceDispute[] = [],
): boolean {
  if (!user) return false;
  const role = user.role;

  /* ── 내부 직원 (EllisOP / EllisAdmin) ── */
  if (user.isInternal) {
    if (role === "EllisOP") {
      /* 본인이 assignee인 티켓에 대한 알림만 */
      if (alert.refType !== "ticket") return false;
      const t = tickets.find(x => x.id === alert.refId);
      return t?.assignee === user.email || t?.assignee === user.email.split("@")[0];
    }
    if (role === "EllisAdmin") {
      /* CMS / 시스템 변경 알림만 (현재 시드엔 명시 type 없으므로 placeholder) */
      const cmsTypes = ["contract_amendment", "role_changed", "subaccount_added"];
      return cmsTypes.includes(alert.type);
    }
    return false;
  }

  /* ── 고객사 측 ── */
  const myCompany = userCompanyId(user);
  if (!myCompany) return false;
  if (alert.customerCompanyId !== myCompany) return false;

  /* Master: 자기 회사 모든 알림 */
  if (role === "Master") return true;

  /* 본인 개인 알림 (points / reward / account 변경 본인 대상) */
  const isPersonal = alert.refType === "user" && alert.refId === user.email;
  if (isPersonal) return true;

  /* OP / Accounting: 본인이 발행한 티켓·분쟁 알림만 */
  if (role === "OP" || role === "Accounting") {
    /* refType=ticket → tickets에서 발행자 확인 */
    if (alert.refType === "ticket") {
      const t = tickets.find(x => x.id === alert.refId);
      if (!t) return false;
      /* traces[0].by가 발행자 */
      const creator = t.traces[0]?.by || "";
      return creator === user.email || creator.startsWith(user.email.split("@")[0]);
    }
    /* refType=invoice + 분쟁 alert → 분쟁 발행자 확인 */
    if (alert.refType === "invoice" && (alert.type === "dispute_opened" || alert.type === "dispute_resolved")) {
      const d = disputes.find(x => x.invoiceNo === alert.refId);
      return d?.raisedBy === user.email;
    }
    /* OP는 자기 booking 관련 알림 추가 허용 (예약 데드라인 등) */
    if (role === "OP") {
      const opCategories: Alert["category"][] = ["Booking"];
      if (opCategories.includes(alert.category)) return true;
    }
    return false;
  }

  return false;
}

/**
 * Quiet hours 검사 — 22:00–08:00 사이면 P1/P2 묶음 (P0는 항상 표시).
 * 인자 없이 호출 시 현재 로컬 시간 사용.
 */
export function isInQuietHours(now: Date = new Date()): boolean {
  const hour = now.getHours();
  return hour >= 22 || hour < 8;
}

/** Quiet hours에서 이 alert가 묶여야 하는지 (P1/P2 = mute) */
export function isQuietMuted(alert: Alert, now: Date = new Date()): boolean {
  if (alert.priority === "P0") return false;
  return isInQuietHours(now);
}

/** UI 그룹핑 — 같은 type+refId는 최신 1건만 (나머지는 카운트로). */
export interface GroupedAlerts {
  primary: Alert;
  duplicates: Alert[];
  totalCount: number;
}

export function groupAlerts(alerts: Alert[]): GroupedAlerts[] {
  const map = new Map<string, Alert[]>();
  for (const a of alerts) {
    const key = `${a.type}::${a.refType || "none"}::${a.refId || "none"}`;
    const list = map.get(key) || [];
    list.push(a);
    map.set(key, list);
  }
  const groups: GroupedAlerts[] = [];
  for (const list of map.values()) {
    list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    groups.push({
      primary: list[0],
      duplicates: list.slice(1),
      totalCount: list.length,
    });
  }
  groups.sort((a, b) => b.primary.createdAt.localeCompare(a.primary.createdAt));
  return groups;
}
