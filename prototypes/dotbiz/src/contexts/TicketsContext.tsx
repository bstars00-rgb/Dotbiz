import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { tickets as initialTickets, type Ticket } from "@/mocks/tickets";

/* Category (DIDA-style from CreateTicketDialog) → ticketType (internal) mapping */
const CATEGORY_TO_TYPE: Record<string, Ticket["ticketType"]> = {
  "Request hotel confirmation": "Special Request",
  "No reservation found": "Complaint",
  "Room rate problem": "Refund Request",
  "Booking mismatch": "Complaint",
  "Hotel Problems": "Complaint",
  "Apply for early departure": "Date Change",
  "Invoice issues": "Refund Request",
};

/* Category → default priority */
const CATEGORY_TO_PRIORITY: Record<string, Ticket["priority"]> = {
  "Request hotel confirmation": "Medium",
  "No reservation found": "High",
  "Room rate problem": "Medium",
  "Booking mismatch": "High",
  "Hotel Problems": "High",
  "Apply for early departure": "Medium",
  "Invoice issues": "Low",
};

interface NewTicketInput {
  bookingId: string;
  hotelName: string;
  guestName: string;
  category: string;
  subOption?: string;
  arrivalStatus: string;
  notes: string;
  attachments?: string[];
}

interface TicketsContextType {
  tickets: Ticket[];
  addTicket: (input: NewTicketInput) => Ticket;
  updateStatus: (id: string, status: Ticket["status"], note?: string, by?: string) => void;
  addTrace: (id: string, action: string, note: string, by: string) => void;
  getTicketsByBooking: (bookingId: string) => Ticket[];
}

const TicketsContext = createContext<TicketsContextType | null>(null);

function pad(n: number) { return String(n).padStart(2, "0"); }
function now() {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function TicketsProvider({ children }: { children: ReactNode }) {
  const [tickets, setTickets] = useState<Ticket[]>(initialTickets);

  const addTicket = useCallback((input: NewTicketInput): Ticket => {
    const id = `TK-2026-${String(tickets.length + 1).padStart(3, "0")}`;
    const ticketType = CATEGORY_TO_TYPE[input.category] || "Special Request";
    const priority = CATEGORY_TO_PRIORITY[input.category] || "Medium";
    const today = now();
    const eta = (() => { const d = new Date(); d.setDate(d.getDate() + 2); return d.toISOString().split("T")[0]; })();
    const description = [input.category, input.subOption, input.notes].filter(Boolean).join(" / ");

    const newTicket: Ticket = {
      id, ticketType,
      bookingId: input.bookingId, hotelName: input.hotelName, guestName: input.guestName,
      status: "Pending", priority, createdAt: today, updatedAt: today, estimatedCompletion: eta,
      description: description || "(No description provided)",
      assignee: "",
      traces: [{ date: today, action: "Ticket Created", by: `${input.guestName} (Self)`, note: `Category: ${input.category}${input.subOption ? ` / ${input.subOption}` : ""}. Arrival status: ${input.arrivalStatus}.${input.notes ? ` Notes: ${input.notes}` : ""}` }],
    };
    setTickets(prev => [newTicket, ...prev]);
    return newTicket;
  }, [tickets.length]);

  const updateStatus = useCallback((id: string, status: Ticket["status"], note = "", by = "Agent") => {
    setTickets(prev => prev.map(t => t.id === id ? {
      ...t, status, updatedAt: now(),
      traces: [...t.traces, { date: now(), action: `Status changed to ${status}`, by, note }],
    } : t));
  }, []);

  const addTrace = useCallback((id: string, action: string, note: string, by: string) => {
    setTickets(prev => prev.map(t => t.id === id ? {
      ...t, updatedAt: now(),
      traces: [...t.traces, { date: now(), action, by, note }],
    } : t));
  }, []);

  const getTicketsByBooking = useCallback((bookingId: string) => {
    return tickets.filter(t => t.bookingId === bookingId);
  }, [tickets]);

  return (
    <TicketsContext.Provider value={{ tickets, addTicket, updateStatus, addTrace, getTicketsByBooking }}>
      {children}
    </TicketsContext.Provider>
  );
}

export function useTickets() {
  const ctx = useContext(TicketsContext);
  if (!ctx) throw new Error("useTickets must be used within TicketsProvider");
  return ctx;
}
