/* ── Monthly Booking Statistics ── */
export const monthlyBookingStats = [
  { month: "Oct 2025", confirmed: 128, cancelled: 12, deferredCredit: 8 },
  { month: "Nov 2025", confirmed: 135, cancelled: 15, deferredCredit: 10 },
  { month: "Dec 2025", confirmed: 162, cancelled: 18, deferredCredit: 12 },
  { month: "Jan 2026", confirmed: 118, cancelled: 14, deferredCredit: 7 },
  { month: "Feb 2026", confirmed: 142, cancelled: 11, deferredCredit: 9 },
  { month: "Mar 2026", confirmed: 156, cancelled: 16, deferredCredit: 11 },
];

/* ── Cancellation Statistics ── */
export const monthlyCancelRate = [
  { month: "Oct 2025", rate: 8.6, count: 12 },
  { month: "Nov 2025", rate: 10.0, count: 15 },
  { month: "Dec 2025", rate: 10.0, count: 18 },
  { month: "Jan 2026", rate: 10.6, count: 14 },
  { month: "Feb 2026", rate: 7.2, count: 11 },
  { month: "Mar 2026", rate: 9.3, count: 16 },
];

export const cancelReasons = [
  { reason: "Change of plans", count: 32, color: "#FF6000" },
  { reason: "Guest cancelled", count: 24, color: "#FF8C00" },
  { reason: "Found better option", count: 15, color: "#0369A1" },
  { reason: "Date change needed", count: 10, color: "#009505" },
  { reason: "Duplicate booking", count: 5, color: "#7C3AED" },
];

/* ── Daily Statistics (31 days) ── */
export const dailyStats = (() => {
  const data: { date: string; bookingCount: number; bookingAmount: number }[] = [];
  const base = new Date("2026-03-11");
  for (let i = 0; i < 31; i++) {
    const d = new Date(base);
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().slice(0, 10);
    const isWeekend = d.getDay() === 0 || d.getDay() === 6;
    const count = Math.round((isWeekend ? 3 : 6) + Math.random() * 5);
    const amount = Math.round(count * (280 + Math.random() * 120));
    data.push({ date: dateStr, bookingCount: count, bookingAmount: amount });
  }
  return data;
})();

/* ── Year-End Comparison ── */
export const yearEndStats = [
  { month: "Jan", y2024: 95, y2025: 108, y2026: 118 },
  { month: "Feb", y2024: 88, y2025: 115, y2026: 142 },
  { month: "Mar", y2024: 102, y2025: 128, y2026: 156 },
  { month: "Apr", y2024: 110, y2025: 135, y2026: 0 },
  { month: "May", y2024: 125, y2025: 142, y2026: 0 },
  { month: "Jun", y2024: 138, y2025: 155, y2026: 0 },
  { month: "Jul", y2024: 152, y2025: 168, y2026: 0 },
  { month: "Aug", y2024: 148, y2025: 160, y2026: 0 },
  { month: "Sep", y2024: 130, y2025: 145, y2026: 0 },
  { month: "Oct", y2024: 118, y2025: 128, y2026: 0 },
  { month: "Nov", y2024: 108, y2025: 135, y2026: 0 },
  { month: "Dec", y2024: 142, y2025: 162, y2026: 0 },
];

export const yearTotals = {
  y2024: { bookings: 1456, revenue: 423800, roomNights: 3890 },
  y2025: { bookings: 1681, revenue: 512600, roomNights: 4520 },
  y2026: { bookings: 416, revenue: 128400, roomNights: 1120 },
};
