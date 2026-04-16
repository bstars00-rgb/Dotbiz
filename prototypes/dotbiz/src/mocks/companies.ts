export interface Company {
  id: string;
  name: string;
  businessRegNo: string;
  businessType: "Prepaid" | "Postpaid";
  address: string;
  phone: string;
  email: string;
  contractDate: string;
}

export const companies: Company[] = [
  { id: "comp-001", name: "TravelCo International", businessRegNo: "123-45-67890", businessType: "Postpaid", address: "123 Gangnam-daero, Seoul", phone: "02-1234-5678", email: "info@travelco.com", contractDate: "2024-03-15" },
  { id: "comp-002", name: "Asia Tours Ltd.", businessRegNo: "234-56-78901", businessType: "Prepaid", address: "456 Teheran-ro, Seoul", phone: "02-2345-6789", email: "info@asiatours.com", contractDate: "2024-06-01" },
];

export const currentCompany = companies[0];
