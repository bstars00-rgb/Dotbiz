import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"
import { visualizer } from "rollup-plugin-visualizer"
import path from "path"

/**
 * Vite 설정 — Code splitting 적용 (gh-pages 호환)
 *
 * 변경 이력:
 *   • 이전: vite-plugin-singlefile로 모든 JS/CSS를 index.html에 inline
 *     → 단일 파일 배포는 단순했으나 초기 로드 2.4MB 강제
 *   • 현재: 다중 파일 빌드 + React.lazy로 라우트별 청크 분리
 *     → 초기 ~400KB, 페이지 진입 시 추가 청크 (~50-150KB)
 *
 * gh-pages 베이스: /Dotbiz/ (저장소 이름)
 * HashRouter 사용 중이므로 base 경로만 정확하면 라우팅은 OK.
 */
export default defineConfig({
  base: "/Dotbiz/",
  plugins: [
    react(),
    tailwindcss(),
    /* 번들 분석 — `npm run build` 후 dist/stats.html 열어서 확인.
     * ANALYZE=1 환경 변수로만 활성화. 일반 빌드는 비활성. */
    ...(process.env.ANALYZE
      ? [visualizer({ filename: "dist/stats.html", template: "treemap", gzipSize: true, brotliSize: true, open: false }) as any]
      : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    /* modulepreload 비활성화 — 라우트별 lazy 청크가 초기 HTML에서 preload되면
     * code splitting 효과가 사라짐. 사용자가 해당 라우트로 이동할 때만 fetch. */
    modulePreload: false,
    /* 청크 분할 전략: 큰 의존성을 vendor로 분리.
     * Vite 8(rolldown)는 manualChunks를 함수 형태로 요구. */
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes("node_modules")) {
            /* React 코어 — 대부분 페이지에서 공유, 별도 청크로 캐시 효율 ↑ */
            if (
              id.includes("/react/") ||
              id.includes("/react-dom/") ||
              id.includes("/react-router/") ||
              id.includes("/scheduler/")
            ) return "react-vendor";
            /* 차트 — Dashboard에서만 필요 */
            if (id.includes("/recharts/") || id.includes("/d3-")) return "charts";
            /* 지도 — Map Search에서만 필요 */
            if (id.includes("/leaflet")) return "maps";
            /* 애니메이션 */
            if (id.includes("/framer-motion/")) return "animation";
            /* 기타 vendor */
            return "vendor";
          }
          /* Mock 데이터 — 페이지별 chunk에 자동 포함되지 않고 공유 chunk로 분리.
           * MainLayout이 statically import하는 alerts/rewards는 어차피 eager에 들어가지만,
           * 그 외 큰 mock은 본인 chunk로 빠져 페이지 코드와 분리됨. */
          if (id.includes("/src/mocks/")) {
            const m = id.match(/\/src\/mocks\/([^./]+)/);
            if (m) {
              const name = m[1];
              /* 가장 큰 mock들만 별도 chunk로 — 작은 것은 인라인 OK */
              if (["rewards", "settlement", "dashboard", "alerts", "approvals", "reviews", "bookings"].includes(name)) {
                return `mock-${name}`;
              }
            }
          }
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/test/setup.ts",
    css: true,
  },
})
