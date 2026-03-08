import React, { useState } from "react";
import { getOrderById, updateOrderStatus } from "../utils/api/orders";
import { showToastSuccess, showToastError } from "../utils/alerts";
import InputField from "../components/common/InputField";
import { Button } from "../components/ui/button";
import type { Order, OrderItem } from "../types";
import { Loader2 } from "lucide-react";

const OrderPickupConfirmationPage: React.FC = () => {
  const [orderId, setOrderId] = useState("");
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setOrder(null);
    if (!orderId.trim()) {
      showToastError({ title: "Error", text: "Please enter an Order ID." });
      return;
    }

    setLoading(true);
    try {
      const fetchedOrder = await getOrderById(orderId);
      setOrder(fetchedOrder);
    } catch (err) {
      console.error("Error fetching order:", err);
      showToastError({ title: "Error", text: "Order not found or an error occurred." });
      setError("Order not found or an error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmPickup = async () => {
    if (!order || !order.id) return;

    setSubmitting(true);
    try {
      await updateOrderStatus(order.id, "complete");
      showToastSuccess({ title: "Success", text: `Order ${order.id} marked as complete!` });
      setOrder((prevOrder) => (prevOrder ? { ...prevOrder, status: "complete" } : null));
    } catch (err) {
      console.error("Error updating order status:", err);
      showToastError({ title: "Error", text: "Failed to update order status." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="bg-card p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold text-center text-card-foreground mb-6">ยืนยันการจ่ายออเดอร์</h2>
        <form onSubmit={handleSearch} className="mb-4">
          <InputField
            label="รหัสออเดอร์"
            name="orderId"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            placeholder="ป้อนรหัสออเดอร์"
            type="text"
            required
          />
          <Button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "ค้นหาออเดอร์"
            )}
          </Button>
        </form>

        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        {order && (
          <div className="border p-4 rounded-md bg-secondary/50">
            <h3 className="text-lg font-semibold mb-2">รายละเอียดออเดอร์: {order.id}</h3>
            <p><strong>ชื่อลูกค้า:</strong> {order.customerName}</p>
            <p><strong>สถานะ:</strong> {order.status === "pending" ? "รอดำเนินการ" : "เสร็จสิ้น"}</p>
            <p className="mb-2"><strong>รายการสินค้า:</strong></p>
            <ul className="list-disc list-inside ml-4 mb-4">
              {order.order_items.map((item: OrderItem, index: number) => (
                <li key={index}>{item.productName} ({item.pound} ปอนด์, {item.quantity} ชิ้น)</li>
              ))}
            </ul>
            <Button
              onClick={handleConfirmPickup}
              className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
              disabled={submitting || order.status === "complete"}
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : order.status === "complete" ? (
                "ออเดอร์นี้เสร็จสิ้นแล้ว"
              ) : (
                "ยืนยันการจ่ายออเดอร์"
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderPickupConfirmationPage;
