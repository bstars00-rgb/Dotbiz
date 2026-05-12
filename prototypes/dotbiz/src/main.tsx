import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

/* Restore dark mode from localStorage before render */
if (localStorage.getItem('dotbiz_dark') === 'true') {
  document.documentElement.classList.add('dark');
}

/* ── 자동 새로고침 가드 (배포 후 stale chunk 404 방지) ──
 * 배포 직후 사용자가 옛 index.html 캐시 + 새 dist 환경에 있을 때
 * dynamic import (lazy load)가 404로 실패할 수 있음.
 * 한 번만 hard reload하여 새 index.html을 받게 한다 (무한 reload 방지). */
const RELOAD_FLAG = "__dotbiz_chunk_reload__";
window.addEventListener("error", (event) => {
  const msg = event.message || "";
  const isChunkError =
    msg.includes("Failed to fetch dynamically imported module") ||
    msg.includes("ChunkLoadError") ||
    msg.includes("Loading chunk") ||
    msg.includes("Loading CSS chunk");
  if (isChunkError && !sessionStorage.getItem(RELOAD_FLAG)) {
    sessionStorage.setItem(RELOAD_FLAG, "1");
    /* 캐시 우회 후 새 index.html 로드 */
    window.location.reload();
  }
});
/* unhandledrejection도 동일 처리 (lazy import는 promise 거부로 옴) */
window.addEventListener("unhandledrejection", (event) => {
  const msg = String(event.reason?.message || event.reason || "");
  const isChunkError =
    msg.includes("Failed to fetch dynamically imported module") ||
    msg.includes("ChunkLoadError") ||
    msg.includes("Loading chunk");
  if (isChunkError && !sessionStorage.getItem(RELOAD_FLAG)) {
    sessionStorage.setItem(RELOAD_FLAG, "1");
    window.location.reload();
  }
});
/* 정상 로드 성공 시 flag clear (다음 배포 시 다시 작동) */
window.addEventListener("load", () => {
  setTimeout(() => sessionStorage.removeItem(RELOAD_FLAG), 5000);
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
