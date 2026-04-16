export interface OperatingPartner {
  id: string;
  name: string;
  email: string;
  status: "Active" | "Pending" | "Deactivated";
  shareRatio: number;
}

export const operatingPartners: OperatingPartner[] = [
  { id: "op-001", name: "Sarah Kim", email: "sarah@travelco.com", status: "Active", shareRatio: 35 },
  { id: "op-002", name: "Michael Lee", email: "michael@travelco.com", status: "Active", shareRatio: 30 },
  { id: "op-003", name: "Emily Chen", email: "emily@travelco.com", status: "Pending", shareRatio: 20 },
  { id: "op-004", name: "David Tanaka", email: "david@travelco.com", status: "Deactivated", shareRatio: 15 },
];
