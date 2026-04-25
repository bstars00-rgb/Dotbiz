/**
 * i18n 누락 감사 — 모든 키가 5개 로케일(EN/KO/JA/ZH/VI) 모두 비어있지 않은지 검증.
 *
 * 새 키 추가 시 일부 로케일만 채우고 까먹는 일을 방지. CI에서 자동으로 잡힘.
 */
import { describe, it, expect } from "vitest";
import strings, { type Locale } from "@/i18n/strings";

const EXPECTED_LOCALES: Locale[] = ["EN", "KO", "JA", "ZH", "VI"];

describe("i18n 누락 감사", () => {
  it("모든 키는 5개 로케일을 모두 가져야 함", () => {
    const missing: Array<{ key: string; locale: Locale }> = [];
    for (const [key, locales] of Object.entries(strings)) {
      for (const loc of EXPECTED_LOCALES) {
        const v = locales[loc];
        if (!v || typeof v !== "string" || v.trim() === "") {
          missing.push({ key, locale: loc });
        }
      }
    }
    if (missing.length > 0) {
      console.error("[i18n] 누락된 번역:", missing);
    }
    expect(missing).toEqual([]);
  });

  it("키가 최소 50개 이상 (커버리지 회귀 방지)", () => {
    expect(Object.keys(strings).length).toBeGreaterThanOrEqual(50);
  });

  it("EN 라벨이 다른 로케일과 동일한 경우는 의도적 (브랜드명/약어)이거나 누락 의심", () => {
    /* EN === KO인 키는 대개 브랜드명 (CMS, FAQ, OhMy Blog 등). 5개 미만이어야 정상.
     * 갑자기 늘어나면 번역 누락 가능성 → 알림용. */
    let identical = 0;
    for (const locales of Object.values(strings)) {
      if (locales.EN === locales.KO) identical++;
    }
    expect(identical).toBeLessThan(10);
  });
});
