/* Browser-safe file download utilities */

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
