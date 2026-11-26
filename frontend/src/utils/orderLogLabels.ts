export const ORDER_FIELD_LABELS: Record<string, string> = {
  customerName: "ชื่อลูกค้า",
  phone: "เบอร์โทร",
  advisor: "ครูที่ปรึกษา",
  deposit: "เงินมัดจำ",
  totalPrice: "ยอดรวม",
  pickup_date: "กำหนดวันรับเค้ก",
  picked_up_at: "วันที่รับเค้ก",
  time_type: "ช่วงเวลา",
  status: "สถานะ",
  book_id: "เล่ม",
  number: "เลขที่",
  classroom_id: "ห้องเรียน",
  team_id: "ทีม",
  officer_prepare_id: "ผู้จัดเตรียม",
  officer_pickup_id: "ผู้จ่ายเค้ก",
  orderDate: "วันที่สั่งจอง",
};

const STATUS_LABELS: Record<string, string> = {
  pending: "อยู่ระหว่างดำเนินการ",
  approved: "เตรียมเค้กเสร็จสิ้น",
  complete: "เสร็จสิ้น",
  cancelled: "ยกเลิก",
};

const TIME_TYPE_LABELS: Record<string, string> = {
  morning: "เช้า",
  afternoon: "บ่าย",
};

export function formatLogValue(field: string, value: unknown): string {
  if (value === null || value === undefined || value === "") {
    return "-";
  }
  if (field === "status") {
    return STATUS_LABELS[String(value)] || String(value);
  }
  if (field === "time_type") {
    return TIME_TYPE_LABELS[String(value)] || String(value);
  }
  if (field === "pickup_date" || field === "picked_up_at" || field === "orderDate") {
    const d = new Date(String(value));
    if (!Number.isNaN(d.getTime())) {
      return d.toLocaleDateString("th-TH", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    }
  }
  if (field === "deposit" || field === "totalPrice") {
    const num = Number(value);
    if (!Number.isNaN(num)) {
      return `฿${num.toLocaleString("th-TH")}`;
    }
  }
  return String(value);
}
