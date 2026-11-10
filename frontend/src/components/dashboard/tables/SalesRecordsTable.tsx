import React, { useState, useEffect } from "react";
import { getCakeSettings } from "../../../utils/api/settings";
import type { ICakeSettings } from "../../../types/cake";

interface ProductQuantities {
  qty1Pound: number;
  qty2Pound: number;
  qty3Pound: number;
  qty4Pound: number;
  qty5Pound: number;
  totalQuantity: number;
  totalPound: number;
  totalPrice: number;
}

interface DailySalesRecord {
  date: string;
  productSales: { [productName: string]: ProductQuantities };
  dailyTotalQuantity: number;
  dailyTotalPrice: number;
  dailyTotalPound: number;
  totalQty1Pound: number;
  totalQty2Pound: number;
  totalQty3Pound: number;
  totalQty4Pound: number;
  totalQty5Pound: number;
  totalPound1P: number;
  totalPound2P: number;
  totalPound3P: number;
  totalPound4P: number;
  totalPound5P: number;
}

interface SalesRecordsTableProps {
  salesRecords: DailySalesRecord[];
  productNames: string[];
  loggedInUsername?: string;
  academicYear?: string;
  newYear?: string;
}

const SalesRecordsTable: React.FC<SalesRecordsTableProps> = ({
  salesRecords,
  productNames,
  loggedInUsername,
  academicYear: propAcademicYear,
  newYear: propNewYear,
}) => {
  const [cakeSettings, setCakeSettings] = useState<ICakeSettings | null>(null);

  useEffect(() => {
    // If academicYear and newYear were already provided by parent, skip fetching
    if (propAcademicYear && propNewYear) return;

    const fetchSettings = async () => {
      try {
        const settings = await getCakeSettings();
        setCakeSettings(settings);
      } catch (error) {
        console.error("Failed to fetch cake settings:", error);
      }
    };
    fetchSettings();
  }, [propAcademicYear, propNewYear]);
  // Destructure productNames
  const poundSizes = ["1P", "2P", "3P", "4P", "5P"];

  const initialProductQuantities: ProductQuantities = {
    qty1Pound: 0,
    qty2Pound: 0,
    qty3Pound: 0,
    qty4Pound: 0,
    qty5Pound: 0,
    totalQuantity: 0,
    totalPound: 0,
    totalPrice: 0,
  };

  const selectedYear =
    propAcademicYear ||
    localStorage.getItem("academicYear") ||
    cakeSettings?.academicYear ||
    (new Date().getFullYear() + 543).toString();

  const displayAcademicYear =
    propAcademicYear ||
    cakeSettings?.academicYear ||
    selectedYear;

  const displayNewYear =
    propNewYear ||
    cakeSettings?.currentYear ||
    (parseInt(displayAcademicYear) + 1).toString();

  return (
    <div className="p-8 max-w-full mx-auto text-foreground">
      <div className="text-center mb-6">
        <h1 className="text-lg font-bold mb-2">วิทยาลัยอาชีวศึกษานครปฐม</h1>
        <h2 className="text-base mb-2">ฝ่ายจ่ายเค้กตามใบสั่งจอง</h2>
        <h3 className="text-sm">
          ยอดการสั่งจองเค้ก ปีใหม่ {displayNewYear}{" "}
          (ดำเนินการประจำปี {displayAcademicYear})
        </h3>
      </div>

      <div className="overflow-x-auto border border-gray-400 dark:border-slate-700 print:border-gray-400">
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="border-b border-gray-400 dark:border-slate-700 print:border-gray-400">
              <th
                rowSpan={2}
                className="py-3 px-4 text-center text-sm font-bold border-r border-gray-400 dark:border-slate-700 print:border-gray-400 bg-gray-100 dark:bg-slate-800 print:bg-gray-100 text-foreground"
              >
                วันที่ / ชนิดเค้ก
              </th>
              {productNames.map((name, index) => (
                <th
                  key={name}
                  colSpan={5}
                  className={`py-2 px-4 text-center text-sm font-bold border-r-2 border-gray-600 dark:border-slate-600 print:border-gray-600 ${
                    index % 2 === 0
                      ? "bg-blue-200 dark:bg-blue-950/60 dark:text-blue-200 print:bg-blue-200"
                      : "bg-red-200 dark:bg-rose-950/60 dark:text-rose-200 print:bg-red-200"
                  }`}
                >
                  {name}
                </th>
              ))}
              <th
                colSpan={2}
                className="py-2 px-4 text-center text-sm font-bold bg-green-200 dark:bg-emerald-950/60 dark:text-emerald-200 print:bg-green-200"
              >
                รวมรายวัน
              </th>
            </tr>
            <tr className="border-b border-gray-400 dark:border-slate-700 print:border-gray-400 bg-gray-50 dark:bg-slate-800/50 print:bg-gray-50">
              {productNames.map((name) => (
                <React.Fragment key={name}>
                  {poundSizes.map((pound) => (
                    <th
                      key={`${name}-${pound}`}
                      className="py-2 px-2 text-center text-xs font-semibold border-r border-gray-300 dark:border-slate-700 print:border-gray-300"
                    >
                      {pound}
                    </th>
                  ))}
                </React.Fragment>
              ))}
              <th className="py-2 px-2 text-center text-xs font-semibold border-r border-gray-300 dark:border-slate-700 print:border-gray-300 bg-green-100 dark:bg-emerald-950/40 print:bg-green-100">
                จำนวน
              </th>
              <th className="py-2 px-2 text-center text-xs font-semibold bg-green-100 dark:bg-emerald-950/40 print:bg-green-100">
                ปอนด์
              </th>
            </tr>
          </thead>
          <tbody>
            {salesRecords.map((record, index) => (
              <tr
                key={record.date}
                className={`border-b border-gray-300 dark:border-slate-700/80 print:border-gray-300 ${
                  index % 2 === 0
                    ? "bg-card hover:bg-muted/40"
                    : "bg-muted/30 hover:bg-muted/60"
                }`}
              >
                <td className="py-2 px-4 text-sm border-r border-gray-400 dark:border-slate-700 print:border-gray-400 font-medium">
                  {new Date(record.date).toLocaleDateString("th-TH", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </td>
                {productNames.map((productName) => {
                  const productQuantities =
                    record.productSales[productName] ||
                    initialProductQuantities; // Use initial if not found
                  return (
                    <React.Fragment key={productName}>
                      <td className="py-2 px-2 text-center text-sm border-r border-gray-300 dark:border-slate-700/80 print:border-gray-300">
                        {productQuantities.qty1Pound || 0}
                      </td>
                      <td className="py-2 px-2 text-center text-sm border-r border-gray-300 dark:border-slate-700/80 print:border-gray-300">
                        {productQuantities.qty2Pound || 0}
                      </td>
                      <td className="py-2 px-2 text-center text-sm border-r border-gray-300 dark:border-slate-700/80 print:border-gray-300">
                        {productQuantities.qty3Pound || 0}
                      </td> 
                      <td className="py-2 px-2 text-center text-sm border-r border-gray-300 dark:border-slate-700/80 print:border-gray-300">
                        {productQuantities.qty4Pound || 0}
                      </td>
                      <td className="py-2 px-2 text-center text-sm border-r-2 border-gray-600 dark:border-slate-600 print:border-gray-600">
                        {productQuantities.qty5Pound || 0}
                      </td>{" "}
                    </React.Fragment>
                  );
                })}
                <td className="py-2 px-2 text-center text-sm border-r border-gray-300 dark:border-slate-700/80 print:border-gray-300 font-semibold bg-green-50 dark:bg-emerald-950/30 print:bg-green-50">
                  {record.dailyTotalQuantity}
                </td>
                <td className="py-2 px-2 text-center text-sm font-semibold bg-green-50 dark:bg-emerald-950/30 print:bg-green-50">
                  {record.dailyTotalPound}
                </td>
              </tr>
            ))}
            <tr className="border-t-2 border-gray-400 dark:border-slate-600 print:border-gray-400 bg-yellow-100 dark:bg-amber-950/40 dark:text-amber-200 print:bg-yellow-100 font-bold">
              <td className="py-3 px-4 text-sm border-r border-gray-400 dark:border-slate-600 print:border-gray-400">
                รวมชิ้น
              </td>
              {/* Display total quantities for each pound size across all products */}
              {productNames.map((name) => (
                <React.Fragment key={`total-qty-${name}`}>
                  <td className="py-2 px-2 text-center text-sm border-r border-gray-300 dark:border-slate-700/80 print:border-gray-300">
                    {salesRecords.reduce(
                      (sum, r) => sum + (r.productSales[name]?.qty1Pound || 0),
                      0
                    )}
                  </td>
                  <td className="py-2 px-2 text-center text-sm border-r border-gray-300 dark:border-slate-700/80 print:border-gray-300">
                    {salesRecords.reduce(
                      (sum, r) => sum + (r.productSales[name]?.qty2Pound || 0),
                      0
                    )}
                  </td>
                  <td className="py-2 px-2 text-center text-sm border-r border-gray-300 dark:border-slate-700/80 print:border-gray-300">
                    {salesRecords.reduce(
                      (sum, r) => sum + (r.productSales[name]?.qty3Pound || 0),
                      0
                    )}
                  </td>
                  <td className="py-2 px-2 text-center text-sm border-r border-gray-300 dark:border-slate-700/80 print:border-gray-300">
                    {salesRecords.reduce(
                      (sum, r) => sum + (r.productSales[name]?.qty4Pound || 0),
                      0
                    )}
                  </td>
                  <td className="py-2 px-2 text-center text-sm border-r-2 border-gray-600 dark:border-slate-600 print:border-gray-600">
                    {salesRecords.reduce(
                      (sum, r) => sum + (r.productSales[name]?.qty5Pound || 0),
                      0
                    )}
                  </td>
                </React.Fragment>
              ))}
            </tr>

            <tr className="border-t-2 border-gray-400 dark:border-slate-600 print:border-gray-400 bg-yellow-100 dark:bg-amber-950/40 dark:text-amber-200 print:bg-yellow-100 font-bold">
              <td className="py-3 px-4 text-sm border-r border-gray-400 dark:border-slate-600 print:border-gray-400">
                รวมปอนด์
              </td>

              {/* Display total pounds for each pound size across all products */}

              {productNames.map((name) => (
                <React.Fragment key={`total-pound-size-${name}`}>
                  <td className="py-2 px-2 text-center text-sm border-r border-gray-300 dark:border-slate-700/80 print:border-gray-300">
                    {salesRecords.reduce(
                      (sum, r) =>
                        sum + (r.productSales[name]?.qty1Pound || 0) * 1,
                      0
                    )}
                  </td>

                  <td className="py-2 px-2 text-center text-sm border-r border-gray-300 dark:border-slate-700/80 print:border-gray-300">
                    {salesRecords.reduce(
                      (sum, r) =>
                        sum + (r.productSales[name]?.qty2Pound || 0) * 2,
                      0
                    )}
                  </td>

                  <td className="py-2 px-2 text-center text-sm border-r border-gray-300 dark:border-slate-700/80 print:border-gray-300">
                    {salesRecords.reduce(
                      (sum, r) =>
                        sum + (r.productSales[name]?.qty3Pound || 0) * 3,
                      0
                    )}
                  </td>

                  <td className="py-2 px-2 text-center text-sm border-r border-gray-300 dark:border-slate-700/80 print:border-gray-300">
                    {salesRecords.reduce(
                      (sum, r) =>
                        sum + (r.productSales[name]?.qty4Pound || 0) * 4,
                      0
                    )}
                  </td>

                  <td className="py-2 px-2 text-center text-sm border-r-2 border-gray-600 dark:border-slate-600 print:border-gray-600">
                    {salesRecords.reduce(
                      (sum, r) =>
                        sum + (r.productSales[name]?.qty5Pound || 0) * 5,

                      0
                    )}
                  </td>
                </React.Fragment>
              ))}
            </tr>
            <tr className="border-t-2 border-gray-400 dark:border-slate-600 print:border-gray-400 bg-gray-100 dark:bg-slate-800/80 print:bg-gray-100 font-bold">
              <td className="py-3 px-4 text-sm border-r border-gray-400 dark:border-slate-600 print:border-gray-400">
                รวมปอนด์ทั้งสิ้น
              </td>
              {productNames.map((name) => (
                <td
                  key={`total-pound-${name}`}
                  colSpan={5}
                  className="py-3 px-2 text-center text-sm border-r-2 border-gray-600 dark:border-slate-600 print:border-gray-600 bg-gray-100 dark:bg-slate-800/80 print:bg-gray-100"
                >
                  {salesRecords
                    .reduce(
                      (sum, r) => sum + (r.productSales[name]?.totalPound || 0),
                      0
                    )
                    .toLocaleString()}
                </td>
              ))}
              <td
                colSpan={2}
                className="py-3 px-2 text-center text-sm bg-green-100 dark:bg-emerald-950/50 dark:text-emerald-200 print:bg-green-100"
              >
                {salesRecords
                  .reduce((sum, r) => sum + r.dailyTotalPound, 0)
                  .toLocaleString()}
              </td>
            </tr>
            <tr className="border-t-2 border-gray-400 dark:border-slate-600 print:border-gray-400 bg-gray-100 dark:bg-slate-800/80 print:bg-gray-100 font-bold">
              <td className="py-3 px-4 text-sm border-r border-gray-400 dark:border-slate-600 print:border-gray-400">
                เป็นเงิน
              </td>
              {productNames.map((name) => (
                <td
                  key={`total-price-${name}`}
                  colSpan={5}
                  className="py-3 px-2 text-center text-sm border-r-2 border-gray-600 dark:border-slate-600 print:border-gray-600 bg-gray-100 dark:bg-slate-800/80 print:bg-gray-100"
                >
                  {salesRecords
                    .reduce(
                      (sum, r) => sum + (r.productSales[name]?.totalPrice || 0),
                      0
                    )
                    .toLocaleString()}
                </td>
              ))}
              <td
                colSpan={2}
                className="py-3 px-2 text-center text-sm bg-green-100 dark:bg-emerald-950/50 dark:text-emerald-200 print:bg-green-100"
              >
                {salesRecords
                  .reduce((sum, r) => sum + r.dailyTotalPrice, 0)
                  .toLocaleString()}
              </td>
            </tr>
            <tr className="border-t-2 border-gray-400 dark:border-slate-600 print:border-gray-400 bg-gray-100 dark:bg-slate-800/80 print:bg-gray-100 font-bold">
              <td className="py-3 px-4 text-sm border-r border-gray-400 dark:border-slate-600 print:border-gray-400">
                ส่วนลด
              </td>
              {productNames.map((name) => (
                <td
                  key={`total-discount-${name}`}
                  colSpan={5}
                  className="py-3 px-2 text-center text-sm border-r-2 border-gray-600 dark:border-slate-600 print:border-gray-600 bg-gray-100 dark:bg-slate-800/80 print:bg-gray-100"
                >
                  {(
                    salesRecords.reduce(
                      (sum, r) => sum + (r.productSales[name]?.totalPound || 0),
                      0
                    ) * 10
                  ).toLocaleString()}
                </td>
              ))}
              <td
                colSpan={2}
                className="py-3 px-2 text-center text-sm bg-green-100 dark:bg-emerald-950/50 dark:text-emerald-200 print:bg-green-100"
              >
                {(
                  salesRecords.reduce((sum, r) => sum + r.dailyTotalPound, 0) *
                  10
                ).toLocaleString()}
              </td>
            </tr>
            <tr className="border-t-2 border-gray-400 dark:border-slate-600 print:border-gray-400 bg-gray-100 dark:bg-slate-800/80 print:bg-gray-100 font-bold">
              <td className="py-3 px-4 text-sm border-r border-gray-400 dark:border-slate-600 print:border-gray-400">
                ยอดหลังหักส่วนลด
              </td>
              {productNames.map((name) => {
                const totalPrice = salesRecords.reduce(
                  (sum, r) => sum + (r.productSales[name]?.totalPrice || 0),
                  0
                );
                const totalPound = salesRecords.reduce(
                  (sum, r) => sum + (r.productSales[name]?.totalPound || 0),
                  0
                );
                const discount = totalPound * 10;
                const netPrice = totalPrice - discount;
                return (
                  <td
                    key={`net-price-${name}`}
                    colSpan={5}
                    className="py-3 px-2 text-center text-sm border-r-2 border-gray-600 dark:border-slate-600 print:border-gray-600 bg-gray-100 dark:bg-slate-800/80 print:bg-gray-100"
                  >
                    {netPrice.toLocaleString()}
                  </td>
                );
              })}
            
            </tr>
            <tr className="border-t-2 border-gray-400 dark:border-slate-600 print:border-gray-400 bg-gray-100 dark:bg-slate-800/80 print:bg-gray-100 font-bold">
              <td className="py-3 px-4 text-sm border-r border-gray-400 dark:border-slate-600 print:border-gray-400">
                รวมเงินทั้งสิ้น
              </td>
              <td
                colSpan={productNames.length * 5 + 2}
                className="py-3 px-2 text-center text-sm bg-green-100 dark:bg-emerald-950/50 dark:text-emerald-200 print:bg-green-100"
              >
                {(
                  salesRecords.reduce(
                    (sum, r) => sum + r.dailyTotalPrice,
                    0
                  ) -
                  salesRecords.reduce(
                    (sum, r) => sum + r.dailyTotalPound,
                    0
                  ) *
                    10
                ).toLocaleString()}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div className="flex justify-between mx-auto mt-5">
        <span>ระบบ CakeLog</span>
        <div className="grid grid-cols-1">
          <span>พิมพ์โดย: {loggedInUsername}</span>
          <span>
            วันที่: {new Date().toLocaleDateString("th-TH", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
          <span>เวลา: {new Date().toLocaleTimeString("th-Th")}</span>
        </div>
      </div>
    </div>
  );
};

export default SalesRecordsTable;
