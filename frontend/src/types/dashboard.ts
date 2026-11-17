import type { Product } from "./product";

export interface SalesRecord {
  id: string;
  productName: string;
  qty1Pound: number;
  qty2Pound: number;
  qty3Pound: number;
  qty4Pound: number;
  qty5Pound: number;
  totalQuantity: number;
  totalPrice: number;
  saleDate: string;
}

export interface ProductQuantities {
  qty1Pound: number;
  qty2Pound: number;
  qty3Pound: number;
  qty4Pound: number;
  qty5Pound: number;
  totalQuantity: number;
  totalPound: number;
  totalPrice: number;
}

export interface DailySalesRecord {
  date: string;
  productSales: { [productName: string]: ProductQuantities };
  dailyTotalQuantity: number;
  dailyTotalPrice: number;
  dailyTotalPound: number;
  totalQty1Pound: number;
  totalQty2Pound: number;
  totalQty3Pound: number;
  totalQty4Pound: number;
  totalQty5Pound: number;
  totalPound1P: number;
  totalPound2P: number;
  totalPound3P: number;
  totalPound4P: number;
  totalPound5P: number;
}

export interface TopTeamItem {
  id: string;
  name: string;
  team_type: "team" | "person";
  total_sales_pounds: number;
  total_sales_baht: number;
  student_member_name?: string[];
  departmentName?: string;
}

export interface ProductBreakdownItem {
  id: string;
  name: string;
  totalQuantity: number;
  totalPounds: number;
  totalPrice: number;
  percentage: number;
}

export interface FulfillmentStats {
  totalOrders: number;
  completedOrders: number;
  preparedOrders: number;
  pendingOrders: number;
  cancelledOrders: number;
  fulfillmentRate: number;
  totalPounds: number;
  pickedUpPounds: number;
  remainingPounds: number;
}

export interface DashboardSummary {
  totalSalesAmount: number;
  totalOrdersCount: number;
  topDepartments: {
    name: string;
    totalPounds: number;
  }[];
  topTeams: TopTeamItem[];
  productBreakdown: ProductBreakdownItem[];
  fulfillmentStats: FulfillmentStats;
  salesRecords: SalesRecord[];
  dailySales: { date: string; amount: number }[];
  dailyPounds: { date: string; pounds: number }[];
  departmentPounds: {
    id: string;
    name: string;
    totalPounds: number;
  }[];
  departmentCakeQuantities: {
    id: string;
    name: string;
    totalQuantity: number;
  }[];
  allProducts: Product[];
}
