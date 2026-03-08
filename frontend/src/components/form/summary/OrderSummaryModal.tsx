import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import type {
  OrderFormState,
  Department,
  Year,
  Team,
  Classroom,
} from "../../../types";
import { calculateCakeItemTotals } from "../../../utils/calculations";
import { getCakeSettings } from "../../../utils/api/settings"; // Import getCakeSettings
import type { ICakeSettings } from "../../../types/cake"; // Import ICakeSettings

interface OrderSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  formData: OrderFormState;
  grandTotal: number;
  netPayable: number;
  remainingBalance: number;
  deposit: number;
  departmentsData: Department[];
  yearsData: Year[];
  classroomsData: Classroom[];
  teamsData: Team[];
}

const OrderSummaryModal: React.FC<OrderSummaryModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  formData,
  grandTotal,
  netPayable,
  remainingBalance,
  deposit,
  departmentsData,
  yearsData,
  classroomsData,
}) => {
  const [cakeSettings, setCakeSettings] = useState<ICakeSettings | null>(null);
  const [isLoadingCakeSettings, setIsLoadingCakeSettings] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const settings = await getCakeSettings();
        setCakeSettings(settings);
      } catch (error) {
        console.error("Failed to fetch cake settings:", error);
      } finally {
        setIsLoadingCakeSettings(false);
      }
    };
    fetchSettings();
  }, []);
  const getDisplayName = (id: string, data: { id: string; name: string }[]) => {
    const item = data.find((d) => d.id === id);
    return item ? item.name : id;
  };

  const levelMap: Record<string, string> = {
    VOCATIONAL: "ปวช.",
    HIGHER: "ปวส.",
  };

  const depositAmount = deposit;
  const currentRemainingBalance = remainingBalance;

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-50 h-screen"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[95vw] max-w-[900px] max-h-[95vh] bg-white shadow-2xl z-50 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-gradient-to-r from-pink-50 to-purple-50">
          <h2 className="text-2xl font-bold text-gray-800">
            ตัวอย่างใบสั่งซื้อ
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-200 transition"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Form Preview - Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50 text-black">
          <div className="max-w-[800px] mx-auto bg-pink-50 p-8 shadow-lg relative">
            {/* Header ของฟอร์ม */}

            {/* ข้อมูลหัวใบสั่ง */}
            <div className="flex justify-between gap-4 mb-6 text-sm">
              <div className="flex">
                <span className="font-semibold">เล่มที่:</span>
                <span className="flex-1 px-2">
                  {formData.book_number || (formData as any).book?.bookNumber || formData.book_id || "_______"}
                </span>
              </div>
              <div className="text-center mb-6 pb-4">
                <p className="text-lg text-gray-700">
                  วิทยาลัยอาชีวศึกษานครปฐม
                </p>
                <p className="text-md text-gray-600">ใบสั่งจองเค้ก</p>
              </div>
              <div className="flex">
                <span className="font-semibold">เลขที่:</span>
                <span className="flex-1 px-2">
                  {formData.number || "_______"}
                </span>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 mb-6 text-sm">
              <div className="flex">
                <span className="font-semibold ">ชื่อ-สกุล:</span>
                <span className="border-b border-gray-400 flex-1 px-2">
                  {formData.customerName || ""}
                </span>
              </div>
              {/* ระดับชั้น ห้อง */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex">
                  <span className="font-semibold ">ระดับชั้น:</span>
                  <span className="border-b border-gray-400 flex-1 px-2">
                    {formData.year_id
                      ? getDisplayName(
                          formData.year_id,
                          yearsData.map((y) => ({
                            id: y.id,
                            name: `${levelMap[y.level]} ${y.year}`,
                          }))
                        )
                      : ""}
                  </span>
                </div>
                <div className="flex">
                  <span className="font-semibold">ห้อง:</span>
                  <span className="border-b border-gray-400 flex-1 px-2">
                    {formData.classroom_id
                      ? getDisplayName(formData.classroom_id, classroomsData)
                      : ""}
                  </span>
                </div>
              </div>
              <div className="flex">
                <span className="font-semibold">แผนก:</span>
                <span className="border-b border-gray-400 flex-1 px-2 truncate">
                  {formData.department_id
                    ? getDisplayName(formData.department_id, departmentsData)
                    : ""}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
              <div className="flex w-1/2">
                <span className="font-semibold">เบอร์โทร:</span>
                <span className="border-b border-gray-400 flex-1 px-2 ">
                  {formData.phone || ""}
                </span>
              </div>
              <div className="flex">
                <span className="font-semibold">ครูที่ปรึกษา:</span>
                <span className="border-b border-gray-400 flex-1 px-2">
                  {formData.advisor || ""}
                </span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
              <div className="flex">
                <span className="font-semibold ">วันที่รับเค้ก:</span>
                <span className="border-b border-gray-400 flex-1 px-2">
                  {formData.pickup_date
                    ? new Date(formData.pickup_date).toLocaleDateString(
                        "th-TH",
                        {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                        }
                      )
                    : ""}
                </span>
              </div>
              <div className="flex">
                <span className="font-semibold">ช่วงเวลา:</span>
                <span className="border-b border-gray-400 flex-1 px-2 text-xs">
                  {formData.time_type === "morning"
                    ? "☑ เช้า (08.00-12.00)"
                    : "☐ เช้า (08.00-12.00)"}{" "}
                  {formData.time_type === "afternoon"
                    ? "☑ บ่าย (13.00-18.00)"
                    : "☐ บ่าย (13.00-18.00)"}
                </span>
              </div>
            </div>
            {/* ตารางรายการเค้ก */}
            <div className="mb-6 overflow-x-auto">
              <table className="w-full border-2 border-pink-300 text-xs">
                <thead>
                  <tr className="bg-pink-200">
                    <th className="border border-pink-300 p-2 text-center whitespace-nowrap">
                      เนื้อเค้ก
                      <br />
                      ราคา/ปอนด์
                    </th>
                    <th
                      className="border border-pink-300 p-2 text-center"
                      colSpan={5}
                    >
                      จำนวนชิ้น/ขนาดปอนด์
                    </th>
                    <th
                      className="border border-pink-300 p-2 text-center"
                      colSpan={2}
                    >
                      จำนวนรวม
                    </th>
                    <th className="border border-pink-300 p-2 text-center">
                      รวมเงิน
                    </th>
                  </tr>
                  <tr className="bg-pink-100">
                    <th className="border border-pink-300 p-1"></th>
                    <th className="border border-pink-300 p-1 text-center">
                      1 ปอนด์
                    </th>
                    <th className="border border-pink-300 p-1 text-center">
                      2 ปอนด์
                    </th>
                    <th className="border border-pink-300 p-1 text-center">
                      3 ปอนด์
                    </th>
                    <th className="border border-pink-300 p-1 text-center">
                      4 ปอนด์
                    </th>
                    <th className="border border-pink-300 p-1 text-center">
                      5 ปอนด์
                    </th>
                    <th className="border border-pink-300 p-1 text-center">
                      ชิ้น
                    </th>
                    <th className="border border-pink-300 p-1 text-center">
                      ปอนด์
                    </th>
                    <th className="border border-pink-300 p-1"></th>
                  </tr>
                </thead>
                <tbody>
                  {formData.cakeItems.map((item) => {
                    const calculated = calculateCakeItemTotals(item);
                    return (
                      <tr key={item.id} className="bg-white">
                        <td className="border border-pink-300 p-2 whitespace-nowrap">
                          {item.name}{" "}
                          <span className="text-xs">
                            {item.pricePerPound} บาท
                          </span>
                        </td>
                        <td className="border border-pink-300 p-2 text-center">
                          {item.qty1Pound || "-"}
                        </td>
                        <td className="border border-pink-300 p-2 text-center">
                          {item.qty2Pound || "-"}
                        </td>
                        <td className="border border-pink-300 p-2 text-center">
                          {item.qty3Pound || "-"}
                        </td>
                        <td className="border border-pink-300 p-2 text-center">
                          {item.qty4Pound || "-"}
                        </td>
                        <td className="border border-pink-300 p-2 text-center">
                          {item.qty5Pound || "-"}
                        </td>
                        <td className="border border-pink-300 p-2 text-center font-semibold">
                          {calculated.totalPieces}
                        </td>
                        <td className="border border-pink-300 p-2 text-center font-semibold">
                          {calculated.totalPounds}
                        </td>
                        <td className="border border-pink-300 p-2 text-right font-semibold whitespace-nowrap">
                          {calculated.totalAmount.toLocaleString()}
                        </td>
                      </tr>
                    );
                  })}
                  {/* แถวรวม */}
                  <tr className="bg-pink-100 font-bold">
                    <td
                      colSpan={6}
                      className="border border-pink-300 p-2 text-right"
                    >
                      รวม
                    </td>
                    <td className="border border-pink-300 p-2 text-center">
                      {formData.cakeItems.reduce(
                        (sum, item) =>
                          calculateCakeItemTotals(item).totalPieces + sum,
                        0
                      )}
                    </td>
                    <td className="border border-pink-300 p-2 text-center">
                      {formData.cakeItems.reduce(
                        (sum, item) =>
                          calculateCakeItemTotals(item).totalPounds + sum,
                        0
                      )}
                    </td>
                    <td className="border border-pink-300 p-2 text-right">
                      {grandTotal.toLocaleString()}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* สรุปยอดเงิน */}
            <div className="grid gap-8 grid-cols-2">
              <div></div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>
                    ส่วนลด (10 บาท x {(formData.discount / 10).toFixed(0)}{" "}
                    ปอนด์):
                  </span>
                  <span className="font-semibold">
                    {formData.discount.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="font-bold">สุทธิที่ต้องชำระ:</span>
                  <span className="font-bold text-lg">
                    {netPayable.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* ลายเซ็น */}  
            <div className="grid grid-cols-2 gap-8 text-sm">
              <div className="text-center">
                <div className="h-5 mb-2"></div>
                <div className=" border-gray-400 pt-1">
                  <div className="flex justify-between mb-4">
                    <span className="">ยอดเงินมัดจำ:</span>
                    <span className="font-semibold border-b border-gray-400 flex-1 px-2">
                      {(depositAmount || 0).toLocaleString()}
                    </span>
                    <span>บาท</span>
                  </div>
                  <br />
                  <div className="flex flex-col items-center">
                    <span className="block border-b border-gray-400 w-40 h-6"></span>
                    <span className="text-xs mt-2">({formData.advisor})</span>
                    <span className="text-xs mt-2">(ครูที่ปรึกษา)</span>
                  </div>
                </div>
              </div>
              <div className="text-center">
                <div className="h-5 mb-2"></div>
                <div className=" border-gray-400 pt-1">
                  <div className="flex justify-between mb-4">
                    <span>ยอดค้างชำระ:</span>
                    <span className="font-semibold border-b border-gray-400 flex-1 px-2">
                      {currentRemainingBalance.toLocaleString()}
                    </span>
                    <span>บาท</span>
                  </div>
                  <br />
                  <div className="flex flex-col items-center">
                    <span className="block border-b border-gray-400 w-40 h-6"></span>
                    <span className="text-xs mt-2">
                      (ผู้รับเงินค่าจำหน่าย/การเงิน)
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* หมายเหตุ */}
            <div className="mt-6 text-xs space-y-1 text-gray-700">
              <p className="font-semibold">*หมายเหตุ:</p>
              <p>
                1. ชำระเงินมัดจำ อย่างน้อย ปอนด์ละ 100 บาท ในวันที่สั่งจองเค้ก
              </p>
              <p>
                2. การรับเค้กที่สั่งจอง ขอให้นักเรียน
                นักศึกษามารับเค้กในวันและเวลาที่นักเรียน นักศึกษา
              </p>
              <p className="pl-4">ระบุไว้ในใบสั่งจองเค้ก</p>
              {!isLoadingCakeSettings && cakeSettings ? (
                <p className="pl-4">
                  - วันที่{" "}
                  {cakeSettings.pickupStartDate
                    ? new Date(cakeSettings.pickupStartDate).getDate()
                    : ""}-
                  {cakeSettings.pickupEndDate
                    ? new Date(cakeSettings.pickupEndDate).getDate()
                    : ""}{" "}
                  {cakeSettings.pickupEndDate
                    ? new Date(cakeSettings.pickupEndDate).toLocaleDateString(
                        "th-TH",
                        { month: "long", year: "numeric" }
                      )
                    : ""}{" "}
                  รับเค้กได้ตั้งแต่เวลา {cakeSettings.pickupStartTime || ""} -{" "}
                  {cakeSettings.pickupEndTime || ""} น.
                </p>
              ) : (
                <p className="pl-4">
                  - วันที่ 25-30 ธันวาคม 2568 รับเค้กได้ตั้งแต่เวลา 08.00 - 18.00
                  น.
                </p>
              )}
              <p>
                3. การสั่งจองเค้กของนักเรียน นักศึกษาได้ส่วนลดปอนด์ละ 10 บาท
              </p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end space-x-4 px-6 py-4 bg-gray-50 border-t">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition"
          >
            แก้ไข
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-6 py-2 rounded-md text-sm font-medium text-white bg-green-600 hover:bg-green-700 transition shadow-sm"
          >
            ยืนยันและบันทึก
          </button>
        </div>
      </div>
    </>
  );
};

export default OrderSummaryModal;
