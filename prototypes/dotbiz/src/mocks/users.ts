export interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: "Master" | "OP";
  status: "Active" | "Pending" | "Deactivated";
  companyId: string;
  avatar?: string;
}

export const users: User[] = [
  { id: "usr-001", fullName: "James Park", email: "james@travelco.com", phone: "010-1234-5678", role: "Master", status: "Active", companyId: "comp-001" },
  { id: "usr-002", fullName: "Sarah Kim", email: "sarah@travelco.com", phone: "010-2345-6789", role: "OP", status: "Active", companyId: "comp-001" },
  { id: "usr-003", fullName: "Michael Lee", email: "michael@travelco.com", phone: "010-3456-7890", role: "OP", status: "Active", companyId: "comp-001" },
  { id: "usr-004", fullName: "Emily Chen", email: "emily@travelco.com", phone: "010-4567-8901", role: "OP", status: "Pending", companyId: "comp-001" },
  { id: "usr-005", fullName: "David Tanaka", email: "david@travelco.com", phone: "010-5678-9012", role: "OP", status: "Deactivated", companyId: "comp-001" },
];

export const currentUser = users[0];
