/**
 * 결정 #4 — POSTPAY 결제 데드라인 알림 (사전 D-N + 사후 aging) 검증
 */
import { describe, it, expect } from "vitest";
import { alerts, alertTypeMeta, defaultAlertPreferences, undisableableAlerts } from "@/mocks/alerts";

describe("결정 #4 — POSTPAY 알림", () => {
  it("사전 알림 4단계가 alertTypeMeta에 등록", () => {
    ["postpay_invoice_d7", "postpay_invoice_d3", "postpay_invoice_d1", "postpay_invoice_dday"].forEach(t => {
      expect(alertTypeMeta[t as keyof typeof alertTypeMeta]).toBeDefined();
      expect(alertTypeMeta[t as keyof typeof alertTypeMeta].category).toBe("Settlement");
    });
  });

  it("사후 aging 3단계 (1d/7d/30d)가 alertTypeMeta에 등록", () => {
    ["postpay_overdue_d1", "postpay_overdue_d7", "postpay_overdue_d30"].forEach(t => {
      expect(alertTypeMeta[t as keyof typeof alertTypeMeta]).toBeDefined();
      expect(alertTypeMeta[t as keyof typeof alertTypeMeta].priority).toBe("P0");
    });
  });

  it("defaultAlertPreferences에 7개 신규 타입 모두 enabled=true 기본값", () => {
    const newTypes = [
      "postpay_invoice_d7", "postpay_invoice_d3", "postpay_invoice_d1", "postpay_invoice_dday",
      "postpay_overdue_d1", "postpay_overdue_d7", "postpay_overdue_d30",
    ];
    newTypes.forEach(t => {
      const pref = defaultAlertPreferences.find(p => p.type === t);
      expect(pref).toBeDefined();
      expect(pref?.enabled).toBe(true);
    });
  });

  it("D-Day와 30일 연체는 undisableable", () => {
    expect(undisableableAlerts).toContain("postpay_invoice_dday");
    expect(undisableableAlerts).toContain("postpay_overdue_d30");
    expect(undisableableAlerts).toContain("postpay_overdue_d7");
  });

  it("시드 alerts에 POSTPAY 사전 + 사후 알림 존재", () => {
    const d7 = alerts.find(a => a.type === "postpay_invoice_d7");
    const d3 = alerts.find(a => a.type === "postpay_invoice_d3");
    const overdue7 = alerts.find(a => a.type === "postpay_overdue_d7");
    expect(d7).toBeDefined();
    expect(d3).toBeDefined();
    expect(overdue7).toBeDefined();
    expect(d7?.refType).toBe("invoice");
    expect(d7?.actionPath).toMatch(/\/app\/settlement/);
  });

  it("D-3 사전 알림은 P0, D-7은 P1 (긴급도 차등)", () => {
    expect(alertTypeMeta.postpay_invoice_d7.priority).toBe("P1");
    expect(alertTypeMeta.postpay_invoice_d3.priority).toBe("P0");
  });
});
