import { Role } from './common';
import type { Teacher } from './teacher';
import type { OrderBook } from './orderBook';

export interface User {
  id: string;
  firstname: string;
  lastname: string;
  username: string;
  password?: string;
  email?: string;
  role: Role;
  createdAt?: string;
  updatedAt?: string;
  teacher_id?: string | null;
  teacher?: (Teacher & {
    department?: {
      id: string;
      name: string;
    };
    classroom?: any[];
  }) | null;
  ownedBooks?: OrderBook[];
}