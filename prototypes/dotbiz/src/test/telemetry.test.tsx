/**
 * 텔레메트리 hook 검증 — window.__dotbizTelemetry가 등록되어 있을 때 ErrorBoundary가
 * captureException을 호출하는지. 프로덕션에서 Sentry/Datadog 연동 시 SDK가 이 객체를
 * 주입하면 자동으로 모든 라우트 에러가 수집됨.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render } from "@testing-library/react";
import { ErrorBoundary } from "@/components/ErrorBoundary";

function Bomb() {
  throw new Error("telemetry test error");
}

describe("ErrorBoundary 텔레메트리 hook", () => {
  const originalError = console.error;
  beforeEach(() => {
    console.error = vi.fn();
  });
  afterEach(() => {
    console.error = originalError;
    delete (window as unknown as { __dotbizTelemetry?: unknown }).__dotbizTelemetry;
  });

  it("window.__dotbizTelemetry가 등록되어 있으면 captureException 호출", () => {
    const captureException = vi.fn();
    (window as unknown as { __dotbizTelemetry: { captureException: typeof captureException } }).__dotbizTelemetry = {
      captureException,
    };

    render(
      <ErrorBoundary label="test-route">
        <Bomb />
      </ErrorBoundary>
    );

    expect(captureException).toHaveBeenCalledTimes(1);
    const [err, ctx] = captureException.mock.calls[0];
    expect(err).toBeInstanceOf(Error);
    expect((err as Error).message).toBe("telemetry test error");
    expect((ctx as { extra: { label: string } }).extra.label).toBe("test-route");
  });

  it("텔레메트리 미등록 시 에러 없이 정상 렌더 (noop)", () => {
    expect(() => {
      render(
        <ErrorBoundary>
          <Bomb />
        </ErrorBoundary>
      );
    }).not.toThrow();
  });

  it("텔레메트리 자체가 throw해도 에러 UI는 정상 표시", () => {
    (window as unknown as { __dotbizTelemetry: { captureException: () => void } }).__dotbizTelemetry = {
      captureException: () => {
        throw new Error("telemetry SDK is broken");
      },
    };

    expect(() => {
      render(
        <ErrorBoundary>
          <Bomb />
        </ErrorBoundary>
      );
    }).not.toThrow();
  });
});
