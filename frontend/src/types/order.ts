import { OrderStatus, TimeType, TeamType } from './common';
import type { OrderItem } from '@/types/orderItem'; // Import the new OrderItem interface
import type { CakeItem } from "./cake"; // Keep existing import
import type { User } from "./user";

export interface Order {
  id: string;
  customerName: string;
  classroom_id?: string;
  team_id?: string;
  orderDate: string;
  totalPrice: number;
  book_id: string;
  number: string;
  phone: string;
  pickup_date: string;
  picked_up_at?: string;
  time_type: TimeType
  deposit: number;
  advisor: string;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
  order_items: OrderItem[];
  book?: {
    id: string;
    bookNumber: string;
  };
  classroom?: any; // Add classroom field to access isOrderFinalized
  department_id?: string; // Added
  effectiveDepartmentId?: string; // Added
  departmentName?: string; // Added
  user_id: string;
  user?: User;
  officer_prepare_id?: string | User | null;
  officer_pickup_id?: string | User | null;
  officer_prepare?: User | null;
  officer_pickup?: User | null;
  teamType?: TeamType; // New: Add teamType to the Order interface
  teamName?: string;
  competitionType?: "team" | "person" | "noteam";
}

export interface OrderFormState {
  id?: string;
  createdAt?: string;
  updatedAt?: string;
  customerName: string;
  classroom_id?: string;
  team_id?: string;
  orderDate: string;
  totalPrice: number;
  book_id: string;
  book_number?: string;
  number: string;
  phone: string;
  pickup_date: string;
  picked_up_at?: string;
  time_type?: TimeType;
  deposit: number;
  advisor: string;
  status: OrderStatus;
  cakeItems: CakeItem[];
  discount: number;

  seller: string;
  competitionType: "team" | "person" | "noteam";
  department_id?: string;
  year_id?: string;
  departmentName?: string;
  effectiveDepartmentId?: string;
  student_member_names?: string[];
  user_id?: string;
}
