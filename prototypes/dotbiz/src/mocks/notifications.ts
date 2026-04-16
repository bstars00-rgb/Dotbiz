export interface Notification {
  id: string;
  title: string;
  description: string;
  priority: "Critical" | "High" | "Medium" | "Low";
  category: "Deadlines" | "Payment" | "CheckIn" | "Bookings" | "Cancelled" | "System";
  time: string;
  isRead: boolean;
}

export const notifications: Notification[] = [
  { id: "ntf-001", title: "Cancel Deadline Approaching", description: "ELS-2026-00142 cancel deadline is tomorrow (Apr 9)", priority: "Critical", category: "Deadlines", time: "2 hours ago", isRead: false },
  { id: "ntf-002", title: "Payment Pending", description: "ELS-2026-00155 payment of $580 is pending", priority: "High", category: "Payment", time: "5 hours ago", isRead: false },
  { id: "ntf-003", title: "Check-in Tomorrow", description: "Guest John Smith checks in to Grand Hyatt Seoul tomorrow", priority: "High", category: "CheckIn", time: "1 day ago", isRead: false },
  { id: "ntf-004", title: "Booking Confirmed", description: "ELS-2026-00168 has been confirmed by Mandarin Oriental Tokyo", priority: "Medium", category: "Bookings", time: "1 day ago", isRead: true },
  { id: "ntf-005", title: "Booking Cancelled", description: "ELS-2026-00112 at ANA Crowne Plaza Osaka has been cancelled", priority: "Medium", category: "Cancelled", time: "3 days ago", isRead: true },
  { id: "ntf-006", title: "System Maintenance", description: "Scheduled maintenance on Apr 5, 2:00-4:00 AM KST", priority: "Low", category: "System", time: "5 days ago", isRead: true },
  { id: "ntf-007", title: "New OP Points Earned", description: "You earned 840 OP Points from booking ELS-2026-00142", priority: "Low", category: "Payment", time: "1 week ago", isRead: true },
];

export const notificationSummary = {
  critical: 1,
  unread: 3,
  deadlines: 1,
  payments: 2,
};
