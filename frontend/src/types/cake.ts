// src/types/cake.ts

export interface CakeItemInput extends Omit<CakeItem, "totalPounds" | "totalAmount"> {}

export interface CakeItem {
  id: string;
  name: string;
  pricePerPound: number;
  qty1Pound: number;
  qty2Pound: number;
  qty3Pound: number;
  qty4Pound: number;
  qty5Pound: number;
  totalPounds: number;
  totalAmount: number;
}

export interface ICakeSettings {
  id: string;
  academicYear?: string;
  currentYear?: string;
  pickupStartDate?: string;
  pickupEndDate?: string;
  pickupStartTime?: string;
  pickupEndTime?: string;
  reporterName?: string;
  securityKey?: string;
  createdAt: string;
  updatedAt: string;
}
