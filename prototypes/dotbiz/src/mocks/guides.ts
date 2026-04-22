/* Knowledge Base — Feature Guides.
 *
 * Text Q&A (`faqs` in ./faqs.ts) answers short questions. Guides answer
 * "how do I actually do X" with numbered steps, visuals, and optional
 * in-app deep links to the feature.
 *
 * Each guide has a cover gradient + icon for quick scanning. Steps each
 * have a short title + description + visual placeholder (screenshots go
 * here in production). A step may carry an `actionPath` link and/or a
 * callout (tip / warning) to highlight gotchas.
 */
import type { LucideIcon } from "lucide-react";
import {
  Search, Calendar, Wallet, CreditCard, Users, Ticket, Bell, FileText, Sparkles,
} from "lucide-react";

export type GuideCategory =
  | "Getting Started"
  | "Bookings"
  | "Settlement"
  | "Team"
  | "Support"
  | "Alerts";

export interface GuideStep {
  title: string;
  description: string;
  callout?: { type: "tip" | "warning" | "info"; text: string };
  actionPath?: string;        /* "/app/find-hotel" etc. — adds a "Try it" button */
  actionLabel?: string;
}

export interface Guide {
  id: string;
  title: string;
  category: GuideCategory;
  icon: LucideIcon;
  gradient: string;           /* css linear-gradient(...) for cover */
  summary: string;            /* 1-2 sentences on what the guide teaches */
  estimatedMin: number;       /* read + try time */
  steps: GuideStep[];
  featured?: boolean;         /* show on landing hero row */
  roles?: string[];           /* restrict to Master / OP etc. (optional) */
}

export const guides: Guide[] = [
  /* ─────────── Getting Started ─────────── */
  {
    id: "g-first-login",
    title: "First-time setup & tour",
    category: "Getting Started",
    icon: Sparkles,
    gradient: "linear-gradient(135deg, #FF6000, #FF8C00)",
    summary: "Get oriented in 60 seconds. Learn the sidebar sections, top bar, and where your most-used features live.",
    estimatedMin: 2,
    featured: true,
    steps: [
      {
        title: "The sidebar is organized in three sections",
        description: "WORK (daily tasks), ADMIN (management), and RESOURCES (help & rewards). Dashboard is always your starting point.",
      },
      {
        title: "Top bar: search, notifications, settings",
        description: "Click the bell icon for unread alerts, the language flag to change language, and your company name on the right for quick links.",
      },
      {
        title: "Launch the interactive tutorial anytime",
        description: "The question-mark icon in the top bar opens a spotlight tutorial that walks you through every major feature. Skip or exit at any time.",
        callout: { type: "tip", text: "The tutorial replays whenever you click it — great for onboarding new team members." },
      },
    ],
  },

  /* ─────────── Bookings ─────────── */
  {
    id: "g-first-booking",
    title: "Make your first booking",
    category: "Bookings",
    icon: Calendar,
    gradient: "linear-gradient(135deg, #3B82F6, #8B5CF6)",
    summary: "From hotel search to confirmation — the full booking flow in 4 steps.",
    estimatedMin: 3,
    featured: true,
    steps: [
      {
        title: "Open Find Hotel",
        description: "Click Find Hotel in the WORK section of the sidebar. Enter destination, dates, guest count, and click Search.",
        actionPath: "/app/find-hotel",
        actionLabel: "Open Find Hotel",
      },
      {
        title: "Pick a hotel and a room",
        description: "Filter by price, rating, or amenities. Click a hotel to see rooms, rates, and cancellation policy.",
        callout: { type: "info", text: "Green badge = Free cancel. Red badge = Non-refundable (pay now, no refunds)." },
      },
      {
        title: "Enter guest details",
        description: "Fill in guest name, email, mobile. Special requests go in the notes field — these are forwarded to the hotel.",
      },
      {
        title: "Confirm",
        description: "POSTPAY customers: booking is instantly confirmed and settled in the next invoice. PREPAY: pay by card immediately or wire within the deadline.",
        callout: { type: "warning", text: "PREPAY bookings require the FULL amount — partial payments are not supported." },
      },
    ],
  },
  {
    id: "g-cancel-booking",
    title: "Cancel a booking",
    category: "Bookings",
    icon: Ticket,
    gradient: "linear-gradient(135deg, #EF4444, #F97316)",
    summary: "When and how to cancel, and what happens to the money.",
    estimatedMin: 2,
    steps: [
      {
        title: "Open the booking",
        description: "Bookings → click the row for the booking you want to cancel.",
        actionPath: "/app/bookings",
        actionLabel: "Open Bookings",
      },
      {
        title: "Check the cancellation policy",
        description: "'Free cancel' until its deadline = full refund. After that deadline the booking becomes non-refundable and cannot be cancelled.",
      },
      {
        title: "Click Cancel booking",
        description: "Confirm the action. POSTPAY: a credit note is automatically applied to your next invoice. PREPAY (paid): refund is processed per offline SLA.",
        callout: { type: "tip", text: "Bookings are never deleted. The record stays with status = Cancelled for audit purposes." },
      },
    ],
  },

  /* ─────────── Settlement ─────────── */
  {
    id: "g-credit-line",
    title: "Understand your Credit Line",
    category: "Settlement",
    icon: Wallet,
    gradient: "linear-gradient(135deg, #10B981, #059669)",
    summary: "Credit limit, used, available, thresholds — decoded in 5 steps.",
    estimatedMin: 3,
    featured: true,
    steps: [
      {
        title: "Open Settlement",
        description: "Settlement in the WORK section. Master users only.",
        actionPath: "/app/settlement",
        actionLabel: "Open Settlement",
      },
      {
        title: "The Credit Line card is the heart of this page",
        description: "One unified view: collateral, multiplier (1× for Floating, 2× for Bank Guarantee etc.), credit limit, used, available, and alert thresholds.",
      },
      {
        title: "Watch the progress bar",
        description: "Green = healthy, amber = 50%+ used, orange = low threshold crossed, red = critical.\nTwo dashed markers show where Low and Critical alerts fire.",
      },
      {
        title: "Top up or request an increase",
        description: "Floating Deposit: click 'Top Up Deposit' to wire more. Bank Guarantee / Insurance: click 'Request Increase' to coordinate with your bank/insurer.",
        callout: { type: "info", text: "Credit limit = Deposit × Multiplier. Example: 30k deposit × 2x BG leverage = 60k credit limit." },
      },
      {
        title: "Bookings are blocked if a new booking exceeds available credit",
        description: "Example: 300 USD available, 350 USD booking → hard block at creation time. Top up or settle invoices to unblock.",
      },
    ],
  },
  {
    id: "g-topup",
    title: "Top up your deposit",
    category: "Settlement",
    icon: CreditCard,
    gradient: "linear-gradient(135deg, #F59E0B, #DC2626)",
    summary: "Request a top-up, get your reference code, forward wire instructions to your accounting team.",
    estimatedMin: 3,
    featured: true,
    steps: [
      {
        title: "Open Top Up Deposit",
        description: "Settlement → Credit Line card → 'Top Up Deposit' button.",
        actionPath: "/app/settlement",
        actionLabel: "Open Settlement",
      },
      {
        title: "Enter the amount",
        description: "Minimum varies by currency (e.g. USD 1,000, VND 25M, JPY 150K). Click Next.",
      },
      {
        title: "You receive a reference code (e.g. TUP-SG-20260424-A4F7)",
        description: "This code MUST go in the wire memo/remittance info field. Without it, manual matching delays deposit credit by 3-5 business days.",
        callout: { type: "warning", text: "The reference code expires in 7 days if no wire is received." },
      },
      {
        title: "Forward to your accounting team",
        description: "Use the 'Copy wire instructions' button to copy the full bank info + amount + ref code as a plain-text message. Paste into Slack/email/KakaoTalk to your accounting team.",
        callout: { type: "tip", text: "This is the fastest way when an OP creates the request but the finance team executes the wire." },
      },
      {
        title: "Wait for confirmation",
        description: "Once the wire arrives and is matched to your ref code, you receive a 'Top-up confirmed' notification and your credit updates automatically.",
      },
    ],
  },
  {
    id: "g-aging",
    title: "Read the Aging cards",
    category: "Settlement",
    icon: Wallet,
    gradient: "linear-gradient(135deg, #6366F1, #8B5CF6)",
    summary: "Spot overdue invoices at a glance with the 4-bucket aging breakdown.",
    estimatedMin: 2,
    steps: [
      {
        title: "Settlement → Invoices tab",
        description: "POSTPAY customers see 4 Aging cards at the top: Current, 1-30, 31-60, 60+ Days.",
        actionPath: "/app/settlement?tab=invoices",
        actionLabel: "Open Invoices",
      },
      {
        title: "Each card shows outstanding amount + invoice count",
        description: "Aging is measured from invoice Due Date — not booking date. So an invoice issued yesterday with Due Date = today+5 shows in 'Current' until the 5 days pass.",
      },
      {
        title: "Click a card to filter",
        description: "Highlight any card to filter the invoice list to that aging range. Click again or the ✕ chip to clear.",
        callout: { type: "tip", text: "Use this to focus on just what's overdue and needs action today." },
      },
    ],
  },
  {
    id: "g-email-invoice",
    title: "Email an invoice to your accounting team",
    category: "Settlement",
    icon: FileText,
    gradient: "linear-gradient(135deg, #14B8A6, #0EA5E9)",
    summary: "Send an invoice PDF + CSV directly from the system with audit trail.",
    estimatedMin: 2,
    steps: [
      {
        title: "Open the invoice",
        description: "Settlement → Invoices → click an invoice number.",
      },
      {
        title: "Click Export PDF → then Email Invoice",
        description: "The preview dialog opens. From its footer, click 'Email Invoice'.",
      },
      {
        title: "Choose recipients & attachments",
        description: "To field is pre-filled with your company billing email. Add CC (or let it CC yourself). Toggle PDF and/or line-item CSV attachments. Edit the subject and body.",
        callout: { type: "info", text: "Sending via ELLIS logs the event in the invoice email log — you can see 'Last emailed by ... at ...' on the preview footer." },
      },
      {
        title: "Send via ELLIS",
        description: "Click the orange 'Send via ELLIS' button. Toast confirms how many recipients received it.",
      },
    ],
  },

  /* ─────────── Team ─────────── */
  {
    id: "g-invite-op",
    title: "Invite a team member",
    category: "Team",
    icon: Users,
    gradient: "linear-gradient(135deg, #EC4899, #F43F5E)",
    summary: "Add an OP or fellow Master to your team.",
    estimatedMin: 2,
    roles: ["Master"],
    steps: [
      {
        title: "Open Team",
        description: "Team page in the ADMIN section — Master accounts only.",
        actionPath: "/app/client",
        actionLabel: "Open Team",
      },
      {
        title: "Click 'Add Sub-account'",
        description: "Top-right of the Sub-accounts tab. A dialog opens.",
      },
      {
        title: "Fill in the details",
        description: "Full name, email, department (pick from your existing departments or create a new one first), and role.",
        callout: { type: "info", text: "Master = full admin including Team and Settlement. OP = standard booking operator." },
      },
      {
        title: "Send the invitation",
        description: "The new user receives an email to set their password. Their row shows 'Pending' until they accept.",
      },
    ],
  },
  {
    id: "g-voucher",
    title: "Customize guest voucher branding",
    category: "Team",
    icon: FileText,
    gradient: "linear-gradient(135deg, #A855F7, #3B82F6)",
    summary: "Put your company name, phone, address, and logo on the voucher your guests receive.",
    estimatedMin: 2,
    roles: ["Master"],
    steps: [
      {
        title: "Team → Voucher Setting",
        description: "The last tab on the Team page.",
        actionPath: "/app/client?tab=voucher",
        actionLabel: "Open Voucher Setting",
      },
      {
        title: "Fill in your company info",
        description: "Company name, phone, email, address — these replace OhMyHotel's defaults on the voucher PDF.",
      },
      {
        title: "Upload your logo (optional)",
        description: "PNG or JPG, under 2MB. Appears at the top-left of the voucher.",
      },
      {
        title: "Enable branding and choose scope",
        description: "All bookings (automatic on every voucher) or Manual selection (opt-in per booking).",
      },
    ],
  },

  /* ─────────── Alerts ─────────── */
  {
    id: "g-notifications",
    title: "How notifications work",
    category: "Alerts",
    icon: Bell,
    gradient: "linear-gradient(135deg, #F43F5E, #F59E0B)",
    summary: "What the bell icon shows, what each priority level means, and why some alerts can't be turned off.",
    estimatedMin: 2,
    steps: [
      {
        title: "Click the bell icon in the top bar",
        description: "A panel shows your unread alerts — credit warnings, payment deadlines, hotel confirmations, ticket updates, and more.",
        actionPath: "/app/notifications",
        actionLabel: "Open Notifications",
      },
      {
        title: "Priority levels tell you how urgent it is",
        description: "🔴 P0 Critical = needs action now (payment deadline, credit critical, hotel cancellation).\n🟠 P1 Important = time-sensitive but not immediate (invoice issued, ticket reply).\n⚪ P2 Informational = good to know (sub-account added, contract amendment).",
      },
      {
        title: "Channel routing is configured with your AM",
        description: "Which channels (Email / SMS / Slack) deliver each alert is set up by your OhMyHotel account manager during onboarding — matched to how your team works.",
        callout: { type: "info", text: "Need to change a channel or add a recipient? Contact your AM or open a support ticket." },
      },
      {
        title: "Critical alerts can't be turned off",
        description: "Credit Critical, Payment Deadline Today, Top-up Expired, and Hotel-Cancelled alerts are always delivered — they protect you from losing money or having guests stranded.",
        callout: { type: "warning", text: "This is by design and cannot be overridden, even by Master accounts. It's a safety net." },
      },
    ],
  },

  /* ─────────── Support ─────────── */
  {
    id: "g-ticket",
    title: "Open a support ticket",
    category: "Support",
    icon: Ticket,
    gradient: "linear-gradient(135deg, #0EA5E9, #6366F1)",
    summary: "For disputes, booking change requests, or anything our team should look at manually.",
    estimatedMin: 2,
    steps: [
      {
        title: "Open Tickets",
        description: "WORK → Tickets. See your open and closed tickets.",
        actionPath: "/app/tickets",
        actionLabel: "Open Tickets",
      },
      {
        title: "Click 'New Ticket' and fill in the basics",
        description: "Subject, category (Dispute / Change Request / Question / Other), related booking (if any), and a clear description.",
      },
      {
        title: "Attach any evidence",
        description: "Photos, PDFs, screenshots — anything that speeds up the investigation.",
      },
      {
        title: "Our team replies within 24 hours",
        description: "You'll get a 'Ticket reply' notification when we respond. Continue the conversation in the ticket — disputes eventually close with 'Approved', 'Partial', or 'Rejected'.",
        callout: { type: "tip", text: "Changes to a booking (dates, guest names) are NOT editable — you cancel + rebook, or open a ticket if cancellation isn't possible." },
      },
    ],
  },
];

export function getGuidesByCategory(cat: GuideCategory | "all"): Guide[] {
  return cat === "all" ? guides : guides.filter(g => g.category === cat);
}

export function getFeaturedGuides(): Guide[] {
  return guides.filter(g => g.featured);
}

export const guideCategories: { key: GuideCategory | "all"; label: string; icon: LucideIcon }[] = [
  { key: "all",             label: "All",             icon: Search },
  { key: "Getting Started", label: "Getting Started", icon: Sparkles },
  { key: "Bookings",        label: "Bookings",        icon: Calendar },
  { key: "Settlement",      label: "Settlement",      icon: Wallet },
  { key: "Team",            label: "Team",            icon: Users },
  { key: "Alerts",          label: "Alerts",          icon: Bell },
  { key: "Support",         label: "Support",         icon: Ticket },
];
