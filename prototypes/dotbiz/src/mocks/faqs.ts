export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: "Booking" | "Payment" | "Cancellation" | "Account" | "Technical";
}

export const faqs: FAQ[] = [
  { id: "faq-001", question: "How do I make a hotel booking?", answer: "Navigate to Find Hotel, enter your destination and dates, select a hotel and room, fill in guest information, and confirm your booking.", category: "Booking" },
  { id: "faq-002", question: "What payment methods are available?", answer: "Depending on your company type: Prepaid companies can use corporate cards or Reserve Now Pay Later. Postpaid companies can use Floating Deposit or Credit Line.", category: "Payment" },
  { id: "faq-003", question: "How do I cancel a booking?", answer: "Go to Bookings, click on the booking, and select Cancel Booking. Cancellation fees may apply depending on the hotel policy and timing.", category: "Cancellation" },
  { id: "faq-004", question: "What is an ELLIS Code?", answer: "ELLIS Code is a unique booking reference number generated for each reservation. Use it to track and manage your bookings.", category: "Booking" },
  { id: "faq-005", question: "How do I add an Operating Partner?", answer: "Go to My Account > OP Management (Master only), click Add OP, enter the partner details, and they will receive an activation email.", category: "Account" },
  { id: "faq-006", question: "What are OP Points?", answer: "OP Points are reward points earned from bookings. You can redeem them in the Rewards Mall or transfer them to other OPs within your company.", category: "Payment" },
  { id: "faq-007", question: "How do I download a voucher?", answer: "After booking confirmation, click Download Voucher on the completion page, or find it in the Booking Detail modal.", category: "Booking" },
  { id: "faq-008", question: "What browsers are supported?", answer: "DOTBIZ supports the latest versions of Chrome, Firefox, Safari, and Edge.", category: "Technical" },
];
