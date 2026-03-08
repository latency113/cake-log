import { useState, useEffect } from "react";
import { getSalesData } from "../utils/api";
import type { DashboardSummary, ProductQuantities, DailySalesRecord } from "../types/dashboard";

const useDashboardData = () => {
  const [dashboardSummary, setDashboardSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [consolidatedSalesRecords, setConsolidatedSalesRecords] = useState<DailySalesRecord[]>([]);

  useEffect(() => {
    const fetchSales = async () => {
      try {
        setLoading(true);
        const data = await getSalesData();
        if (!data || !data.salesRecords) {
          setError("ไม่สามารถโหลดข้อมูลยอดขายได้: ข้อมูลไม่ถูกต้อง");
          setLoading(false);
          return;
        }
        setDashboardSummary(data);

        const initialProductQuantities: ProductQuantities = {
          qty1Pound: 0,
          qty2Pound: 0,
          qty3Pound: 0,
          qty4Pound: 0,
          qty5Pound: 0,
          totalQuantity: 0, // Added
          totalPound: 0,    // Added
          totalPrice: 0,    // Added
        };

        const dailySalesMap = new Map<string, DailySalesRecord>();

        // Get all product names from the fetched data to initialize daily records
        const allProductNames = data.allProducts.map(p => p.name);

        data.salesRecords.forEach((record) => {
          const date = record.saleDate;
          if (!dailySalesMap.has(date)) {
            const newDailyRecord: DailySalesRecord = {
              date: date,
              productSales: {},
              dailyTotalQuantity: 0,
              dailyTotalPrice: 0,
              dailyTotalPound: 0, // Added
              totalQty1Pound: 0, // Added
              totalQty2Pound: 0, // Added
              totalQty3Pound: 0, // Added
              totalQty4Pound: 0, // Added
              totalQty5Pound: 0, // Added
              totalPound1P: 0, // Added
              totalPound2P: 0, // Added
              totalPound3P: 0, // Added
              totalPound4P: 0, // Added
              totalPound5P: 0, // Added
            };
            // Initialize productSales for all known products for this date
            allProductNames.forEach(productName => {
              newDailyRecord.productSales[productName] = { ...initialProductQuantities };
            });
            dailySalesMap.set(date, newDailyRecord);
          }

          const dailyRecord = dailySalesMap.get(date)!;
          // console.log("dailyRecord:", dailyRecord); // Debugging - remove after confirming

          const productName = record.productName;
          if (!dailyRecord.productSales[productName]) {
            console.warn(`Product "${productName}" found in sales record but not in allProducts list for date ${date}. Initializing.`);
            dailyRecord.productSales[productName] = { ...initialProductQuantities };
          }

          const productQuantities = dailyRecord.productSales[productName];

          productQuantities.qty1Pound += record.qty1Pound || 0;
          productQuantities.qty2Pound += record.qty2Pound || 0;
          productQuantities.qty3Pound += record.qty3Pound || 0;
          productQuantities.qty4Pound += record.qty4Pound || 0;
          productQuantities.qty5Pound += record.qty5Pound || 0;

          // Calculate total quantity and total pound for this specific product
          productQuantities.totalQuantity += record.totalQuantity || 0; // Assuming record.totalQuantity is for this product
          productQuantities.totalPound +=
            (record.qty1Pound || 0) * 1 +
            (record.qty2Pound || 0) * 2 +
            (record.qty3Pound || 0) * 3 +
            (record.qty4Pound || 0) * 4 +
            (record.qty5Pound || 0) * 5;
          productQuantities.totalPrice += record.totalPrice || 0; // Accumulate total price for this product

          // Calculate total pounds for this record
          const recordTotalPound =
            (record.qty1Pound || 0) * 1 +
            (record.qty2Pound || 0) * 2 +
            (record.qty3Pound || 0) * 3 +
            (record.qty4Pound || 0) * 4 +
            (record.qty5Pound || 0) * 5;

          dailyRecord.dailyTotalQuantity += record.totalQuantity || 0;
          dailyRecord.dailyTotalPrice += record.totalPrice || 0;
          dailyRecord.dailyTotalPound += recordTotalPound;

          dailyRecord.totalQty1Pound += record.qty1Pound || 0;
          dailyRecord.totalQty2Pound += record.qty2Pound || 0;
          dailyRecord.totalQty3Pound += record.qty3Pound || 0;
          dailyRecord.totalQty4Pound += record.qty4Pound || 0;
          dailyRecord.totalQty5Pound += record.qty5Pound || 0;

          dailyRecord.totalPound1P += (record.qty1Pound || 0) * 1;
          dailyRecord.totalPound2P += (record.qty2Pound || 0) * 2;
          dailyRecord.totalPound3P += (record.qty3Pound || 0) * 3;
          dailyRecord.totalPound4P += (record.qty4Pound || 0) * 4;
          dailyRecord.totalPound5P += (record.qty5Pound || 0) * 5;

          dailyRecord.totalQty1Pound += record.qty1Pound || 0;
          dailyRecord.totalQty2Pound += record.qty2Pound || 0;
          dailyRecord.totalQty3Pound += record.qty3Pound || 0;
          dailyRecord.totalQty4Pound += record.qty4Pound || 0;
          dailyRecord.totalQty5Pound += record.qty5Pound || 0;
        });

        // Sort by date and convert to array
        const sortedDailySales = Array.from(dailySalesMap.values()).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        setConsolidatedSalesRecords(sortedDailySales);

      } catch (err) {
        console.error("Error fetching sales data:", err);
        setError("ไม่สามารถโหลดข้อมูลยอดขายได้");
      } finally {
        setLoading(false);
      }
    };

    fetchSales();
  }, []);

  return {
    dashboardSummary,
    loading,
    error,
    consolidatedSalesRecords,
  };
};

export default useDashboardData;
