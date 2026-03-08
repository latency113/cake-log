export interface OrderBook {
  id: string;
  bookNumber: string;
  startNumber: string;
  endNumber: string;
  currentNumber: number;
  maxCapacity: number;
  isClosed: boolean;
  classroom_id?: string | null;
  classroom?: any; // Simplified
  createdAt?: string; // Optional if not always returned/needed
  updatedAt?: string;
  orders?: any[]; // Simplified for now, or use Order[] if needed
}

export interface CreateOrderBookDto {
  bookNumber: string;
  startNumber?: string;
  endNumber?: string;
  maxCapacity?: number;
}

export interface UpdateOrderBookDto {
  bookNumber?: string;
  startNumber?: string;
  endNumber?: string;
  currentNumber?: number;
  maxCapacity?: number;
  isClosed?: boolean;
}
