/* Browser-safe file download utilities
 *
 * ════════════════════════════════════════════════════════════════════
 * Voucher / Invoice 정책 (2026-05-04 결정 — 8가지 점검 영역 마무리)
 * ════════════════════════════════════════════════════════════════════
 *
 * #1 Voucher QR — ❌ 미제공 (호텔 체크인 흐름에 불필요, 제거됨)
 * #2 Invoice 보안 — 시각적 seal + 서명 (현 상태 유지, PDF 암호화 X)
 * #3 보존 정책 — 발급 후 7년 (법정) + 자동 아카이빙
 *    · 회계법: 한국·일본·중국·베트남·싱가포르 모두 7년 표준
 *    · 7년 경과 후 ELLIS 백오피스에서 read-only 아카이브로 이전
 *    · 고객 요청 삭제 불가 (회계 감사 위반)
 * #4 다국어 기본값 — 사용자 i18n locale 자동 적용
 *    · BookingsPage voucherLang / InvoicePreviewDialog lang
 *    · 사용자가 언어 변경 시 그대로 따라감
 * #5 자동 발송 — ELLIS(DOTBIZ 백엔드)에서 SMTP/SES로 발송
 *    · Voucher: 체크인 D-1 자동
 *    · Invoice: 정산 사이클 도래 시 자동
 *    · from: noreply@ohmyhotel.com / reply-to: 회사별 설정
 *    · 발송 기록은 ELLIS DB에 영구 저장 (audit)
 *    · 고객사 Master가 ClientManagement에서 on/off / 받는 사람 관리
 *    · 프로토타입에선 미구현 (정책만 명문화)
 * #6 첨부 형식 — Invoice = PDF + CSV (booking breakdown)
 *    · CSV는 회계팀 import용 booking → amount → account mapping
 * #7 URL 보안 — 로그인 + RBAC
 *    · 현재: Blob URL 일회용 (브라우저 안전)
 *    · 서버 다운로드 URL 도입 시: 로그인 + customerCompanyId 검증
 *    · 본인 회사 invoice만 다운로드 가능 (cross-tenant 차단)
 *    · Master / Accounting / EllisAdmin / EllisOP만 접근
 */

function escapeCsv(v: unknown): string {
  const s = v == null ? "" : String(v);
  if (s.includes(",") || s.includes("\"") || s.includes("\n")) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

/* Download an array of objects as CSV */
export function downloadCSV(filename: string, rows: Record<string, unknown>[], headers?: string[]) {
  if (rows.length === 0) return;
  const cols = headers || Object.keys(rows[0]);
  const lines = [cols.join(","), ...rows.map(r => cols.map(c => escapeCsv(r[c])).join(","))];
  /* UTF-8 BOM for Excel Korean/Japanese compatibility */
  const csv = "\uFEFF" + lines.join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  triggerDownload(blob, filename);
}

/* Download a plain text file */
export function downloadText(filename: string, content: string, mime = "text/plain;charset=utf-8") {
  const blob = new Blob([content], { type: mime });
  triggerDownload(blob, filename);
}

/* Download an HTML file (can be opened in browser or printed as PDF) */
export function downloadHTML(filename: string, html: string) {
  downloadText(filename, html, "text/html;charset=utf-8");
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 100);
}

/* Format today as YYYY-MM-DD_HHMMSS */
export function timestamp(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}_${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
}

/* ─────────── Export History store ─────────── */

export interface ExportRecord {
  id: string;
  fileName: string;
  date: string;
  status: "Completed" | "Expired";
  records: number;
  blobUrl?: string;  // stored in memory only
  content?: string;  // fallback for re-download
  contentType?: string;
}

const EXPORT_HISTORY_KEY = "dotbiz_export_history";

export function getExportHistory(): ExportRecord[] {
  try { const s = localStorage.getItem(EXPORT_HISTORY_KEY); return s ? JSON.parse(s) : []; }
  catch { return []; }
}

export function addExportHistory(fileName: string, records: number, content: string, contentType = "text/csv;charset=utf-8") {
  const all = getExportHistory();
  const record: ExportRecord = {
    id: `exp-${Date.now()}`,
    fileName,
    date: new Date().toISOString().replace("T", " ").slice(0, 19),
    status: "Completed",
    records,
    content,
    contentType,
  };
  all.unshift(record);
  /* Keep last 20, drop content for older items to save localStorage */
  const trimmed = all.slice(0, 20).map((r, i) => i < 10 ? r : { ...r, content: undefined, status: "Expired" as const });
  try { localStorage.setItem(EXPORT_HISTORY_KEY, JSON.stringify(trimmed)); } catch { /* quota */ }
}

export function redownloadExport(id: string) {
  const rec = getExportHistory().find(r => r.id === id);
  if (!rec || !rec.content) return false;
  const blob = new Blob([rec.content], { type: rec.contentType || "text/csv;charset=utf-8" });
  triggerDownload(blob, rec.fileName);
  return true;
}
