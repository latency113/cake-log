import { RequestStatus } from './common';

export interface CakeRequest {
  id: string;
  requestDate: string;
  status: RequestStatus;
  note?: string;
  user_id: string;
  department_id: string;
  createdAt: string;
  updatedAt: string;
}
