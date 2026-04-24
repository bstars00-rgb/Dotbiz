/**
 * ErrorBoundary 테스트
 *
 * 한 페이지의 크래시가 전체 앱을 터뜨리지 않도록 격리하는지 검증.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ErrorBoundary } from "@/components/ErrorBoundary";

/* 의도적으로 throw하는 컴포넌트 */
function Bomb({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) {
    throw new Error("intentional test error");
  }
  return <div>all good</div>;
}

describe("ErrorBoundary", () => {
  /* console.error 스파이 (React가 에러 시 자동 로깅 — 테스트 출력 정돈용) */
  const originalError = console.error;
  beforeEach(() => {
    console.error = vi.fn();
  });
  afterEach(() => {
    console.error = originalError;
  });

  it("자식이 정상일 때 그대로 렌더링", () => {
    render(
      <ErrorBoundary>
        <Bomb shouldThrow={false} />
      </ErrorBoundary>
    );
    expect(screen.getByText("all good")).toBeTruthy();
  });

  it("자식이 throw하면 에러 UI 표시", () => {
    render(
      <ErrorBoundary>
        <Bomb shouldThrow={true} />
      </ErrorBoundary>
    );
    expect(screen.getByText(/페이지 오류/)).toBeTruthy();
    expect(screen.getByText(/다시 시도/)).toBeTruthy();
    expect(screen.getByText(/대시보드로 돌아가기/)).toBeTruthy();
  });

  it("에러 메시지가 details 안에 노출됨", () => {
    render(
      <ErrorBoundary>
        <Bomb shouldThrow={true} />
      </ErrorBoundary>
    );
    /* <details>는 열려 있지 않지만 DOM에는 존재 */
    expect(screen.getByText(/기술 세부 정보/)).toBeTruthy();
    /* 메시지 내용 (details 안) */
    expect(screen.getByText(/intentional test error/)).toBeTruthy();
  });

  it("'다시 시도' 클릭 시 reset (단, children이 여전히 throw면 다시 에러 UI)", () => {
    const { rerender } = render(
      <ErrorBoundary>
        <Bomb shouldThrow={true} />
      </ErrorBoundary>
    );
    expect(screen.getByText(/페이지 오류/)).toBeTruthy();

    /* rerender with non-throwing child and click reset */
    rerender(
      <ErrorBoundary>
        <Bomb shouldThrow={false} />
      </ErrorBoundary>
    );
    /* 초기화 버튼 클릭 */
    fireEvent.click(screen.getByText(/다시 시도/));
    /* 정상 자식 이제 표시되어야 함 */
    expect(screen.getByText("all good")).toBeTruthy();
  });
});

