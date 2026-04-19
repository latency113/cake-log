import React, { useState, useEffect } from "react";
import type {
  OrderFormState,
  Year,
  Team,
  Classroom,
  Department,
} from "../../types";
import { calculateCakeItemTotals } from "../../utils/calculations";
import { getCakeSettings } from "../../utils/api/settings"; // Import getCakeSettings
import type { ICakeSettings } from "../../types/cake"; // Import ICakeSettings

const getDisplayName = (id: string, data: { id: string; name: string }[]) => {
  const item = data.find((d) => d.id === id);
  return item ? item.name : id;
};

const levelMap: Record<string, string> = {
  VOCATIONAL: "ปวช.",
  HIGHER: "ปวส.",
};

interface PrintableContentProps {
  formData: OrderFormState;
  grandTotal: number;
  netPayable: number;
  remainingBalance: number;
  departmentsData: Department[];
  yearsData: Year[];
  classroomsData: Classroom[];
  teamsData: Team[];
}

const PrintableOrderSummaryContent: React.FC<PrintableContentProps> = ({
  formData,
  grandTotal,
  netPayable,
  remainingBalance,
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
  return (
    <div className="w-full mx-auto bg-pink-50 p-4 sm:p-6 md:p-8 rounded-lg relative text-black h-screen">
      {/* Header ของฟอร์ม */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-1 mb-4 sm:mb-6 text-xs sm:text-sm">
        <div className="flex justify-between w-full sm:w-auto">
          <span className="font-semibold">เล่มที่:</span>
          <span className="flex-1 px-2">
            {formData.book_number || (formData as any).book?.bookNumber || formData.book_id}
          </span>
        </div>
        <div className="text-center flex-1">
          <p className="text-base sm:text-lg text-gray-700">
            วิทยาลัยอาชีวศึกษานครปฐม
          </p>
          <p className="text-sm sm:text-md text-gray-600">ใบสั่งจองเค้ก</p>
        </div>
        <div className="flex justify-between w-full sm:w-auto">
          <span className="font-semibold">เลขที่:</span>
          <span className="flex-1 px-2">{formData.number}</span>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-12 gap-x-4 gap-y-1 mb-4 sm:mb-6 text-sm items-center">
        {/* ชื่อ-สกุล (4 ส่วน) */}
        <div className="flex md:col-span-4">
          <span className="font-semibold shrink-0">ชื่อ-สกุล:</span>
          <span className="border-b border-gray-400 flex-1 px-2 truncate">
            {formData.customerName || "_______"}
          </span>
        </div>

        {/* ระดับชั้น (3 ส่วน) */}
        <div className="flex md:col-span-2">
          {" "}
          {/* เพิ่มจาก 1 เป็น 3 */}
          <span className="font-semibold shrink-0">ระดับชั้น:</span>
          <span className="border-b border-gray-400 flex-1 px-2 truncate">
            {formData.year_id
              ? getDisplayName(
                  formData.year_id,
                  yearsData.map((y) => ({
                    id: y.id,
                    name: `${levelMap[y.level]} ${y.year}`,
                  }))
                )
              : "_______"}
          </span>
        </div>

        {/* ห้อง (1 ส่วน) */}
        <div className="flex md:col-span-2">
          {" "}
          {/* คงเดิมที่ 1 */}
          <span className="font-semibold shrink-0">ห้อง:</span>
          <span className="border-b border-gray-400 flex-1 px-2 truncate">
            {formData.classroom_id
              ? getDisplayName(formData.classroom_id, classroomsData)
              : "_______"}
          </span>
        </div>

        {/* แผนก (4 ส่วน) */}
        <div className="flex md:col-span-4">
          {" "}
          {/* ลดจาก 5 เป็น 4 */}
          <span className="font-semibold shrink-0">แผนก:</span>
          <span className="border-b border-gray-400 flex-1 px-2 truncate">
            {formData.department_id
              ? getDisplayName(formData.department_id, departmentsData)
              : "_______"}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-1 mb-4 sm:mb-6 text-sm">
        <div className="flex">
          <span className="font-semibold">เบอร์โทร:</span>
          <span className="border-b border-gray-400 flex-1 px-2 ">
            {formData.phone || "_______"}
          </span>
        </div>
        <div className="flex">
          <span className="font-semibold">ครูที่ปรึกษา:</span>
          <span className="border-b border-gray-400 flex-1 px-2">
            {formData.advisor || "_______"}
          </span>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-1 mb-4 sm:mb-6 text-sm">
        <div className="flex">
          <span className="font-semibold ">วันที่รับเค้ก:</span>
          <span className="border-b border-gray-400 flex-1 px-2">
            {(() => {
              if (formData.pickup_date) {
                const dateObj = new Date(formData.pickup_date);
                if (!isNaN(dateObj.getTime())) {
                  return dateObj.toLocaleDateString("th-TH", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  });
                }
              }
              return "_______";
            })()}
          </span>{" "}
        </div>
        <div className="flex">
          <span className="font-semibold">ช่วงเวลา:</span>
          <span className="border-b border-gray-400 flex-1 px-2 text-xs">
            {(formData.time_type ?? "").toLowerCase().includes("morning")
              ? "☑ เช้า (08.00-12.00)"
              : "☐ เช้า (08.00-12.00)"}{" "}
            {(formData.time_type ?? "").toLowerCase().includes("afternoon")
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
              <th className="border border-pink-300 p-1 text-center">ชิ้น</th>
              <th className="border border-pink-300 p-1 text-center">ปอนด์</th>
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
                    <span className="text-xs">{item.pricePerPound} บาท</span>
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
              <td colSpan={6} className="border border-pink-300 p-2 text-right">
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
              ส่วนลด (10 บาท x {(formData.discount / 10).toFixed(0)} ปอนด์):
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
                {formData.deposit.toLocaleString()}
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
                {remainingBalance.toLocaleString()}
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
        <p>1. ชำระเงินมัดจำ อย่างน้อย ปอนด์ละ 100 บาท ในวันที่สั่งจองเค้ก</p>
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
              : ""}
            -
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
            - วันที่ 25-30 ธันวาคม 2568 รับเค้กได้ตั้งแต่เวลา 08.00 - 18.00 น.
          </p>
        )}
        <p>3. การสั่งจองเค้กของนักเรียน นักศึกษาได้ส่วนลดปอนด์ละ 10 บาท</p>
      </div>
    </div>
  );
};

export default PrintableOrderSummaryContent;
