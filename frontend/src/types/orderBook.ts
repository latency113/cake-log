export interface OrderBook {
  id: string;
  bookNumber: string;
  startNumber: string;
  endNumber: string;
  currentNumber: number;
  maxCapacity: number;
  isClosed: boolean;
  classroom_id?: string | null;
  classroom?: {
    id: string;
    name: string;
    isOrderFinalized?: boolean;
    department?: {
      id: string;
      name: string;
    };
    grade_level?: {
      id: string;
      level: string;
      year: number;
    };
  } | null;
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
  classroom_id?: string | null;
  isOrderFinalized?: boolean;
}
