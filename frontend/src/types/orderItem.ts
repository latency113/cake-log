export interface OrderItem {
  id?: string;
  order_id?: string;
  product_id: string;
  pound: number;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  createdAt?: string;
  updatedAt?: string;
  productName?: string;
}
