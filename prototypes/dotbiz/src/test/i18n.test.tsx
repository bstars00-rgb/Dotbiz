import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { I18nProvider, useI18n } from "@/contexts/I18nContext";

function I18nStatus() {
  const { locale, setLocale, t } = useI18n();
  return (
    <div>
      <p data-testid="locale">{locale}</p>
      <p data-testid="nav-find">{t("nav.findHotel")}</p>
      <p data-testid="nav-dashboard">{t("nav.dashboard")}</p>
      <p data-testid="btn-search">{t("btn.search")}</p>
      <p data-testid="unknown">{t("unknown.key")}</p>
      <button onClick={() => setLocale("KO")}>Korean</button>
      <button onClick={() => setLocale("JA")}>Japanese</button>
      <button onClick={() => setLocale("ZH")}>Chinese</button>
      <button onClick={() => setLocale("EN")}>English</button>
    </div>
  );
}

describe("I18nContext", () => {
  beforeEach(() => {
    localStorage.removeItem("dotbiz_locale");
  });

  it("should default to English", () => {
    render(<I18nProvider><I18nStatus /></I18nProvider>);
    expect(screen.getByTestId("locale")).toHaveTextContent("EN");
    expect(screen.getByTestId("nav-find")).toHaveTextContent("Find Hotel");
    expect(screen.getByTestId("nav-dashboard")).toHaveTextContent("Dashboard");
    expect(screen.getByTestId("btn-search")).toHaveTextContent("Search");
  });

  it("should return key for unknown translations", () => {
    render(<I18nProvider><I18nStatus /></I18nProvider>);
    expect(screen.getByTestId("unknown")).toHaveTextContent("unknown.key");
  });

  it("should switch to Korean", async () => {
    const user = userEvent.setup();
    render(<I18nProvider><I18nStatus /></I18nProvider>);

    await user.click(screen.getByText("Korean"));

    expect(screen.getByTestId("locale")).toHaveTextContent("KO");
    expect(screen.getByTestId("nav-find")).toHaveTextContent("호텔 검색");
    expect(screen.getByTestId("nav-dashboard")).toHaveTextContent("대시보드");
    expect(screen.getByTestId("btn-search")).toHaveTextContent("검색");
  });

  it("should switch to Japanese", async () => {
    const user = userEvent.setup();
    render(<I18nProvider><I18nStatus /></I18nProvider>);

    await user.click(screen.getByText("Japanese"));

    expect(screen.getByTestId("locale")).toHaveTextContent("JA");
    expect(screen.getByTestId("nav-find")).toHaveTextContent("ホテル検索");
    expect(screen.getByTestId("btn-search")).toHaveTextContent("検索");
  });

  it("should switch to Chinese", async () => {
    const user = userEvent.setup();
    render(<I18nProvider><I18nStatus /></I18nProvider>);

    await user.click(screen.getByText("Chinese"));

    expect(screen.getByTestId("locale")).toHaveTextContent("ZH");
    expect(screen.getByTestId("nav-find")).toHaveTextContent("搜索酒店");
    expect(screen.getByTestId("nav-dashboard")).toHaveTextContent("仪表盘");
  });

  it("should persist locale to localStorage", async () => {
    const user = userEvent.setup();
    render(<I18nProvider><I18nStatus /></I18nProvider>);

    await user.click(screen.getByText("Korean"));

    expect(localStorage.getItem("dotbiz_locale")).toBe("KO");
  });

  it("should restore locale from localStorage", () => {
    localStorage.setItem("dotbiz_locale", "JA");
    render(<I18nProvider><I18nStatus /></I18nProvider>);
    expect(screen.getByTestId("locale")).toHaveTextContent("JA");
    expect(screen.getByTestId("nav-find")).toHaveTextContent("ホテル検索");
  });
});
