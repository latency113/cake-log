import React, { useState, useEffect } from "react";
import type {
  OrderFormState,
  Year,
  Team,
  Classroom,
  Department,
} from "../../types";
import { calculateCakeItemTotals } from "../../utils/calculations";
import { getCakeSettings } from "../../utils/api/settings";
import type { ICakeSettings } from "../../types/cake";

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
  teamsData?: Team[];
  isBlackAndWhite?: boolean;
}

const PrintableOrderSummaryContent: React.FC<PrintableContentProps> = ({
  formData,
  grandTotal,
  netPayable,
  remainingBalance,
  departmentsData,
  yearsData,
  classroomsData,
  isBlackAndWhite = false,
}) => {
  const [cakeSettings, setCakeSettings] = useState<ICakeSettings | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const settings = await getCakeSettings();
        setCakeSettings(settings);
      } catch (error) {
        console.error("Failed to fetch cake settings:", error);
      }
    };
    fetchSettings();
  }, []);

  // Resolve Classroom, Grade Level, and Department information cleanly
  const currentClassroom = classroomsData.find(
    (c) => c.id === formData.classroom_id
  );

  const gradeLevelText = (() => {
    if (currentClassroom?.grade_level) {
      const lvl =
        currentClassroom.grade_level.level === "VOCATIONAL"
          ? "ปวช."
          : currentClassroom.grade_level.level === "HIGHER"
          ? "ปวส."
          : currentClassroom.grade_level.level;
      return `${lvl} ${currentClassroom.grade_level.year}`;
    }
    if (formData.year_id) {
      const yearObj = yearsData.find((y) => y.id === formData.year_id);
      if (yearObj) {
        const lvl = levelMap[yearObj.level] || yearObj.level;
        return `${lvl} ${yearObj.year}`;
      }
    }
    return "-";
  })();

  const roomText = currentClassroom
    ? currentClassroom.name
    : formData.classroom_id
    ? getDisplayName(formData.classroom_id, classroomsData)
    : "-";

  const departmentText = (() => {
    if (formData.department_id) {
      const dept = departmentsData.find((d) => d.id === formData.department_id);
      if (dept) return dept.name;
    }
    if (currentClassroom?.department_id) {
      const dept = departmentsData.find(
        (d) => d.id === currentClassroom.department_id
      );
      if (dept) return dept.name;
    }
    if (currentClassroom?.department?.name) {
      return currentClassroom.department.name;
    }
    return (formData as any).departmentName || "-";
  })();

  // Format pickup date in Thai format
  const pickupDateText = (() => {
    if (formData.pickup_date) {
      const dateObj = new Date(formData.pickup_date);
      if (!isNaN(dateObj.getTime())) {
        return dateObj.toLocaleDateString("th-TH", {
          day: "numeric",
          month: "long",
          year: "numeric",
        });
      }
    }
    return "-";
  })();

  // Time slot checkbox state
  const timeSlot = (formData.time_type ?? "").toLowerCase();
  const isMorning = timeSlot.includes("morning") || timeSlot.includes("เช้า");
  const isAfternoon =
    timeSlot.includes("afternoon") || timeSlot.includes("บ่าย");

  // Calculate total pounds
  const totalPoundsAll = formData.cakeItems.reduce(
    (sum, item) => calculateCakeItemTotals(item).totalPounds + sum,
    0
  );

  const totalPiecesAll = formData.cakeItems.reduce(
    (sum, item) => calculateCakeItemTotals(item).totalPieces + sum,
    0
  );

  const isBW = !!isBlackAndWhite;
  const containerBgClass = isBW ? "bg-white" : "bg-pink-50";
  const containerBgStyle = isBW ? { backgroundColor: "#ffffff" } : { backgroundColor: "#fdf2f8" };
  const tableBorderClass = isBW ? "border-2 border-black" : "border-2 border-pink-300";
  const tableBorderStyle = isBW
    ? { borderColor: "#000000", border: "2px solid #000000" }
    : { borderColor: "#f9a8d4", border: "2px solid #f9a8d4" };
  const headerRow1Class = isBW ? "bg-gray-100" : "bg-pink-200";
  const headerRow1Style = isBW ? { backgroundColor: "#f3f4f6" } : { backgroundColor: "#fbcfe8" };
  const headerRow2Class = isBW ? "bg-gray-50" : "bg-pink-100";
  const headerRow2Style = isBW ? { backgroundColor: "#f9fafb" } : { backgroundColor: "#fce7f3" };
  const cellBorderClass = isBW ? "border border-black" : "border border-pink-300";
  const cellBorderStyle = isBW ? { borderColor: "#000000" } : { borderColor: "#f9a8d4" };
  const footerRowClass = isBW ? "bg-gray-100 font-bold text-black" : "bg-pink-100 font-bold text-gray-900";
  const footerRowStyle = isBW ? { backgroundColor: "#f3f4f6" } : { backgroundColor: "#fce7f3" };
  const underlineBorderClass = isBW ? "border-b border-black" : "border-b border-gray-400";

  return (
    <div
      className={`w-full max-w-[210mm] mx-auto ${containerBgClass} p-6 sm:p-8 text-black print:p-0 print:max-w-none text-sm leading-relaxed font-sans`}
      style={containerBgStyle}
    >
      {/* 1. Header ของฟอร์ม */}
      <div className="flex justify-between items-start mb-6">
        <div className="w-1/4 text-left">
          <span className="font-bold text-sm">เล่มที่:</span>{" "}
          <span className="text-sm font-semibold">
            {formData.book_number ||
              (formData as any).book?.bookNumber ||
              formData.book_id ||
              "-"}
          </span>
        </div>

        <div className="w-2/4 text-center">
          <h1 className="text-lg font-bold text-gray-900 tracking-wide">
            วิทยาลัยอาชีวศึกษานครปฐม
          </h1>
          <h2 className="text-sm font-medium text-gray-700 mt-0.5">
            ใบสั่งจองเค้ก
          </h2>
        </div>

        <div className="w-1/4 text-right">
          <span className="font-bold text-sm">เลขที่:</span>{" "}
          <span className="text-sm font-semibold">{formData.number || "-"}</span>
        </div>
      </div>

      {/* 2. ส่วนข้อมูลผู้สั่งและห้องเรียน (แถวที่ 1) */}
      <div className="flex items-center gap-3 mb-3 text-sm">
        <div className="flex items-center flex-[4] min-w-0">
          <span className="font-bold shrink-0 whitespace-nowrap">ชื่อ-สกุล:</span>
          <span className={`${underlineBorderClass} flex-1 ml-1.5 px-2 truncate font-medium`}>
            {formData.customerName || "-"}
          </span>
        </div>

        <div className="flex items-center flex-[2] min-w-0">
          <span className="font-bold shrink-0 whitespace-nowrap">ระดับชั้น:</span>
          <span className={`${underlineBorderClass} flex-1 ml-1.5 px-1 text-center font-medium truncate`}>
            {gradeLevelText}
          </span>
        </div>

        <div className="flex items-center flex-[2] min-w-0">
          <span className="font-bold shrink-0 whitespace-nowrap">ห้อง:</span>
          <span className={`${underlineBorderClass} flex-1 ml-1.5 px-1 text-center font-medium truncate`}>
            {roomText}
          </span>
        </div>

        <div className="flex items-center flex-[4] min-w-0">
          <span className="font-bold shrink-0 whitespace-nowrap">แผนก:</span>
          <span className={`${underlineBorderClass} flex-1 ml-1.5 px-2 truncate font-medium`}>
            {departmentText}
          </span>
        </div>
      </div>

      {/* แถวที่ 2: เบอร์โทร และ ครูที่ปรึกษา */}
      <div className="flex items-center gap-6 mb-3 text-sm">
        <div className="flex items-center flex-1 min-w-0">
          <span className="font-bold shrink-0 whitespace-nowrap">เบอร์โทร:</span>
          <span className={`${underlineBorderClass} flex-1 ml-1.5 px-2 font-medium truncate`}>
            {formData.phone || "-"}
          </span>
        </div>

        <div className="flex items-center flex-1 min-w-0">
          <span className="font-bold shrink-0 whitespace-nowrap">ครูที่ปรึกษา:</span>
          <span className={`${underlineBorderClass} flex-1 ml-1.5 px-2 font-medium truncate`}>
            {formData.advisor || "-"}
          </span>
        </div>
      </div>

      {/* แถวที่ 3: วันที่รับเค้ก และ ช่วงเวลา */}
      <div className="flex items-center gap-6 mb-5 text-sm">
        <div className="flex items-center flex-1 min-w-0">
          <span className="font-bold shrink-0 whitespace-nowrap">วันที่รับเค้ก:</span>
          <span className={`${underlineBorderClass} flex-1 ml-1.5 px-2 font-medium truncate`}>
            {pickupDateText}
          </span>
        </div>

        <div className="flex items-center flex-1 min-w-0">
          <span className="font-bold shrink-0 whitespace-nowrap mr-2">ช่วงเวลา:</span>
          <span className="font-medium flex items-center gap-3">
            <span>
              {isMorning ? "☑" : "☐"} เช้า (08.00-12.00)
            </span>
            <span>
              {isAfternoon ? "☑" : "☐"} บ่าย (13.00-18.00)
            </span>
          </span>
        </div>
      </div>

      {/* 3. ตารางรายการเค้ก */}
      <div className="mb-4 overflow-x-auto">
        <table
          className={`w-full ${tableBorderClass} text-xs border-collapse`}
          style={tableBorderStyle}
        >
          <thead>
            <tr
              className={headerRow1Class}
              style={headerRow1Style}
            >
              <th
                rowSpan={2}
                className={`${cellBorderClass} p-2 text-center font-bold text-gray-900`}
                style={{ width: "26%", ...cellBorderStyle }}
              >
                เนื้อเค้ก
                <br />
                ราคา/ปอนด์
              </th>
              <th
                colSpan={5}
                className={`${cellBorderClass} p-2 text-center font-bold text-gray-900`}
                style={{ width: "44%", ...cellBorderStyle }}
              >
                จำนวนชิ้น/ขนาดปอนด์
              </th>
              <th
                colSpan={2}
                className={`${cellBorderClass} p-2 text-center font-bold text-gray-900`}
                style={{ width: "16%", ...cellBorderStyle }}
              >
                จำนวนรวม
              </th>
              <th
                rowSpan={2}
                className={`${cellBorderClass} p-2 text-center font-bold text-gray-900`}
                style={{ width: "14%", ...cellBorderStyle }}
              >
                รวมเงิน
              </th>
            </tr>
            <tr
              className={headerRow2Class}
              style={headerRow2Style}
            >
              <th
                className={`${cellBorderClass} p-1.5 text-center font-semibold text-gray-800`}
                style={cellBorderStyle}
              >
                1 ปอนด์
              </th>
              <th
                className={`${cellBorderClass} p-1.5 text-center font-semibold text-gray-800`}
                style={cellBorderStyle}
              >
                2 ปอนด์
              </th>
              <th
                className={`${cellBorderClass} p-1.5 text-center font-semibold text-gray-800`}
                style={cellBorderStyle}
              >
                3 ปอนด์
              </th>
              <th
                className={`${cellBorderClass} p-1.5 text-center font-semibold text-gray-800`}
                style={cellBorderStyle}
              >
                4 ปอนด์
              </th>
              <th
                className={`${cellBorderClass} p-1.5 text-center font-semibold text-gray-800`}
                style={cellBorderStyle}
              >
                5 ปอนด์
              </th>
              <th
                className={`${cellBorderClass} p-1.5 text-center font-semibold text-gray-800`}
                style={cellBorderStyle}
              >
                ชิ้น
              </th>
              <th
                className={`${cellBorderClass} p-1.5 text-center font-semibold text-gray-800`}
                style={cellBorderStyle}
              >
                ปอนด์
              </th>
            </tr>
          </thead>
          <tbody>
            {formData.cakeItems.map((item) => {
              const calculated = calculateCakeItemTotals(item);
              return (
                <tr key={item.id} className="bg-white">
                  <td
                    className={`${cellBorderClass} px-3 py-2 text-left font-medium text-gray-800 whitespace-nowrap`}
                    style={cellBorderStyle}
                  >
                    {item.name} {item.pricePerPound} บาท
                  </td>
                  <td
                    className={`${cellBorderClass} p-2 text-center text-gray-700`}
                    style={cellBorderStyle}
                  >
                    {item.qty1Pound || "-"}
                  </td>
                  <td
                    className={`${cellBorderClass} p-2 text-center text-gray-700`}
                    style={cellBorderStyle}
                  >
                    {item.qty2Pound || "-"}
                  </td>
                  <td
                    className={`${cellBorderClass} p-2 text-center text-gray-700`}
                    style={cellBorderStyle}
                  >
                    {item.qty3Pound || "-"}
                  </td>
                  <td
                    className={`${cellBorderClass} p-2 text-center text-gray-700`}
                    style={cellBorderStyle}
                  >
                    {item.qty4Pound || "-"}
                  </td>
                  <td
                    className={`${cellBorderClass} p-2 text-center text-gray-700`}
                    style={cellBorderStyle}
                  >
                    {item.qty5Pound || "-"}
                  </td>
                  <td
                    className={`${cellBorderClass} p-2 text-center font-bold text-gray-900`}
                    style={cellBorderStyle}
                  >
                    {calculated.totalPieces}
                  </td>
                  <td
                    className={`${cellBorderClass} p-2 text-center font-bold text-gray-900`}
                    style={cellBorderStyle}
                  >
                    {calculated.totalPounds}
                  </td>
                  <td
                    className={`${cellBorderClass} px-3 py-2 text-right font-bold text-gray-900 whitespace-nowrap`}
                    style={cellBorderStyle}
                  >
                    {calculated.totalAmount.toLocaleString()}
                  </td>
                </tr>
              );
            })}

            {/* แถวสรุปรวมท้ายตาราง */}
            <tr
              className={footerRowClass}
              style={footerRowStyle}
            >
              <td
                colSpan={6}
                className={`${cellBorderClass} px-4 py-2 text-right font-bold`}
                style={cellBorderStyle}
              >
                รวม
              </td>
              <td
                className={`${cellBorderClass} p-2 text-center font-bold`}
                style={cellBorderStyle}
              >
                {totalPiecesAll}
              </td>
              <td
                className={`${cellBorderClass} p-2 text-center font-bold`}
                style={cellBorderStyle}
              >
                {totalPoundsAll}
              </td>
              <td
                className={`${cellBorderClass} px-3 py-2 text-right font-bold whitespace-nowrap`}
                style={cellBorderStyle}
              >
                {grandTotal.toLocaleString()}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* 4. สรุปยอดเงิน (ชิดขวา) */}
      <div className="flex flex-col items-end gap-1 mb-5 text-sm">
        <div className="flex justify-between w-64">
          <span className="text-gray-700">
            ส่วนลด (10 บาท x {totalPoundsAll} ปอนด์):
          </span>
          <span className="font-bold text-gray-900">
            {formData.discount.toLocaleString()}
          </span>
        </div>
        <div className="flex justify-between w-64 items-baseline pt-1">
          <span className="font-bold text-base text-gray-900">
            สุทธิที่ต้องชำระ:
          </span>
          <span className="font-bold text-xl text-gray-900">
            {netPayable.toLocaleString()}
          </span>
        </div>
      </div>

      {/* 5. ยอดเงินมัดจำ & ยอดค้างชำระ (แนวนอน บรรทัดเดียวกัน) */}
      <div className="flex items-center justify-between gap-8 mb-8 text-sm">
        <div className="flex items-center flex-1 min-w-0">
          <span className="font-bold shrink-0">ยอดเงินมัดจำ:</span>
          <span className={`${underlineBorderClass} flex-1 mx-3 text-center font-bold text-base`}>
            {formData.deposit.toLocaleString()}
          </span>
          <span className="font-bold shrink-0">บาท</span>
        </div>

        <div className="flex items-center flex-1 min-w-0">
          <span className="font-bold shrink-0">ยอดค้างชำระ:</span>
          <span className={`${underlineBorderClass} flex-1 mx-3 text-center font-bold text-base`}>
            {remainingBalance.toLocaleString()}
          </span>
          <span className="font-bold shrink-0">บาท</span>
        </div>
      </div>

      {/* 6. ลายเซ็น 2 ฝั่ง (ครูที่ปรึกษา และ ผู้รับเงิน) */}
      <div className="grid grid-cols-2 gap-8 mb-8 text-sm">
        <div className="flex flex-col items-center text-center">
          <div className={`${underlineBorderClass} w-56 h-8`}></div>
          <div className="text-xs mt-2 font-medium text-gray-800">
            ({formData.advisor || "...................................................."})
          </div>
          <div className="text-xs mt-0.5 text-gray-600">(ครูที่ปรึกษา)</div>
        </div>

        <div className="flex flex-col items-center text-center">
          <div className={`${underlineBorderClass} w-56 h-8`}></div>
          <div className="text-xs mt-2 font-medium text-gray-800">
            (ผู้รับเงินค่าจำหน่าย/การเงิน)
          </div>
        </div>
      </div>

      {/* 7. ส่วนหมายเหตุ ด้านล่างซ้าย */}
      <div className="text-xs text-gray-700 space-y-1 mt-6 text-left">
        <p className="font-bold text-gray-900">*หมายเหตุ:</p>
        <p>1. ชำระเงินมัดจำ อย่างน้อย ปอนด์ละ 100 บาท ในวันที่สั่งจองเค้ก</p>
        <p>
          2. การรับเค้กที่สั่งจอง ขอให้นักเรียน นักศึกษามารับเค้กในวันและเวลาที่นักเรียน นักศึกษา
        </p>
        <p className="pl-4">ระบุไว้ในใบสั่งจองเค้ก</p>
        <p className="pl-4">
          - วันที่{" "}
          {cakeSettings?.pickupStartDate && cakeSettings?.pickupEndDate
            ? `${new Date(cakeSettings.pickupStartDate).getDate()}-${new Date(
                cakeSettings.pickupEndDate
              ).getDate()} ${new Date(
                cakeSettings.pickupEndDate
              ).toLocaleDateString("th-TH", {
                month: "long",
                year: "numeric",
              })} รับเค้กได้ตั้งแต่เวลา ${cakeSettings.pickupStartTime || "09:00"} - ${cakeSettings.pickupEndTime || "18:00"} น.`
            : "25-31 ธันวาคม 2568 รับเค้กได้ตั้งแต่เวลา 09:00 - 18:00 น."}
        </p>
        <p>3. การสั่งจองเค้กของนักเรียน นักศึกษาได้ส่วนลดปอนด์ละ 10 บาท</p>
      </div>
    </div>
  );
};

export default PrintableOrderSummaryContent;
