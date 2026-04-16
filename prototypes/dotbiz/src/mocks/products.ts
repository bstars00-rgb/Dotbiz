export interface Product {
  id: string;
  name: string;
  category: "GiftCards" | "Travel" | "Electronics" | "Lifestyle" | "Dining" | "Entertainment";
  pointsCost: number;
}

export const products: Product[] = [
  { id: "prod-001", name: "Amazon Gift Card $50", category: "GiftCards", pointsCost: 5000 },
  { id: "prod-002", name: "Starbucks Gift Card $25", category: "GiftCards", pointsCost: 2500 },
  { id: "prod-003", name: "Airport Lounge Pass", category: "Travel", pointsCost: 3000 },
  { id: "prod-004", name: "Samsonite Carry-On", category: "Travel", pointsCost: 15000 },
  { id: "prod-005", name: "Apple AirPods Pro", category: "Electronics", pointsCost: 25000 },
  { id: "prod-006", name: "Dyson Hair Dryer", category: "Lifestyle", pointsCost: 40000 },
  { id: "prod-007", name: "Michelin Star Dining $100", category: "Dining", pointsCost: 10000 },
  { id: "prod-008", name: "Netflix 1-Year Sub", category: "Entertainment", pointsCost: 18000 },
];
