import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

/**
 * ErrorBoundary — 한 페이지의 크래시가 전체 앱을 터뜨리지 않도록 격리.
 *
 * MainLayout의 <Outlet /> 주변을 감싸서 각 라우트별로 독립적으로 에러
 * 복구가 가능. 사용자에게 "새로고침 / 대시보드로" 선택지 제공.
 *
 * 프로덕션: componentDidCatch에서 Sentry 등으로 에러 전송.
 * 현재 프로토타입: console.error + UI 표시만.
 */
interface Props {
  children: ReactNode;
  /** 에러 시 페이지 식별용 (optional) */
  label?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error("[ErrorBoundary]", this.props.label || "unknown", error, errorInfo);
    this.setState({ errorInfo });
    /* 프로덕션: Sentry.captureException(error, { extra: errorInfo }); */
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  private handleGoHome = () => {
    window.location.hash = "#/app/dashboard";
    this.handleReset();
  };

  public render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="p-6 max-w-2xl mx-auto">
          <Card className="p-8">
            <Alert variant="destructive" className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>페이지 오류</AlertTitle>
              <AlertDescription>
                이 페이지를 표시하는 중 문제가 발생했습니다.
                새로고침 후에도 계속되면 관리자에게 문의해주세요.
              </AlertDescription>
            </Alert>

            {this.state.error && (
              <details className="text-xs text-muted-foreground mt-4 pl-3 border-l-2 border-muted">
                <summary className="cursor-pointer font-medium">기술 세부 정보 (개발용)</summary>
                <pre className="mt-2 whitespace-pre-wrap font-mono">
                  {this.state.error.message}
                  {"\n\n"}
                  {this.state.error.stack?.split("\n").slice(0, 6).join("\n")}
                </pre>
              </details>
            )}

            <div className="flex items-center gap-2 mt-6">
              <Button onClick={this.handleReset}>
                <RefreshCw className="h-4 w-4 mr-2" />
                이 페이지 다시 시도
              </Button>
              <Button variant="outline" onClick={this.handleGoHome}>
                대시보드로 돌아가기
              </Button>
            </div>

            <p className="text-[10px] text-muted-foreground mt-4">
              오류 ID: <code className="font-mono">
                {this.state.error?.name || "UnknownError"}-{Date.now().toString(36)}
              </code>
            </p>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
