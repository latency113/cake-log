import React, { useState, useEffect } from "react";
import type { Order, Year, Team, Classroom, Department, OrderFormState } from "@/types";
import type { OrderItem } from "../../../types/orderItem";
import type { Product } from "../../../types/product";
import ReactDOM from "react-dom/client";
import { getYears, getClassrooms, getProducts} from "../../../utils/api";
import { calculateCakeItemTotals } from "../../../utils/calculations";
import { getTeams } from "../../../utils/api/teams";
import { getDepartments } from "../../../utils/api/departments";
import PrintableOrderSummaryContent from "../../../components/orders/PrintableOrderSummaryContent";

import {
  Printer,
  CheckCircle2,
} from "lucide-react";

interface OfficerPrepareOrderDetailModalProps {
  order: (Order & { departmentName?: string; time_type?: string }) | null;
  onClose: () => void;
  onMarkAsPickedUp?: (order: Order) => void;
  onApprove?: (orderId: string) => void; // New prop
  showApproveButton?: boolean; // New prop
}

const OfficerPrepareOrderDetailModal: React.FC<OfficerPrepareOrderDetailModalProps> = ({
  order,
  onClose,
  onMarkAsPickedUp,
  onApprove,
  showApproveButton,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [yearsData, setYearsData] = useState<Year[]>([]);
  const [teamsData, setTeamsData] = useState<Team[]>([]);
  const [classroomsData, setClassroomsData] = useState<Classroom[]>([]);
  const [departmentsData, setDepartmentsData] = useState<Department[]>([]);
  const [productsData, setProductsData] = useState<Product[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoadingData(true);
      try {
      const years: Year[] = await getYears();
      const classrooms = await getClassrooms(1, 999); // Fetch all classrooms with large itemsPerPage
      const departments = await getDepartments(); // Fetch departments data
      const teams = await getTeams(); // Fetch all teams
      const products = await getProducts(); // Fetch all products

        setYearsData(years);
        setTeamsData(teams.data); // Fix: Use teams.data
        setClassroomsData(classrooms);
        setDepartmentsData(departments.data); // Set departments data to state
        setProductsData(products); // Store products in state
      } catch (error) {
        console.error("Error fetching data for OfficerPrepareOrderDetailModal:", error);
      } finally {
        setLoadingData(false);
      }
    };

    if (order) {
      fetchData();
      setIsVisible(true);
    } else {
      setIsVisible(false);
      const timer = setTimeout(() => {
        if (!order) {
          onClose();
        }
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [order, onClose]); // Added order to dependencies

  const handlePrint = () => {
    if (!order || loadingData) return; // Don't print if no order or data is loading

    // Calculate props for PrintableOrderSummary
    const discount = (order.order_items ?? []).reduce((total: number, item: OrderItem) => total + (item.pound * item.quantity) * 10, 0); // Fix: order_items
    const grandTotal = order.totalPrice;
    const netPayable = grandTotal - discount;
    const remainingBalance = netPayable - order.deposit;

    const formData: OrderFormState = {
      ...order,
      orderDate: new Date(order.orderDate).toISOString().split('T')[0],
      pickup_date: order.pickup_date ? new Date(order.pickup_date).toISOString().split('T')[0] : '',
      time_type: order.time_type, // Explicitly assign time_type
      book_number: (order as any).book?.bookNumber,
      cakeItems: (() => {
        const cakeItemsMap = new Map<string, any>();

        // Initialize with all products
        productsData.forEach((product) => {
          cakeItemsMap.set(product.id, {
            id: product.id,
            name: product.name,
            pricePerPound: Math.round(product.price),
            qty1Pound: 0,
            qty2Pound: 0,
            qty3Pound: 0,
            qty4Pound: 0,
            qty5Pound: 0,
            totalPounds: 0,
            totalAmount: 0,
          });
        });

        // Overlay with order items
        (order.order_items ?? []).forEach((item: OrderItem) => {
          const existingCakeItem = cakeItemsMap.get(item.product_id);
          if (existingCakeItem) {
            const pound = Number(item.pound);
            switch (pound) {
              case 1: existingCakeItem.qty1Pound += item.quantity; break;
              case 2: existingCakeItem.qty2Pound += item.quantity; break;
              case 3: existingCakeItem.qty3Pound += item.quantity; break;
              case 4: existingCakeItem.qty4Pound += item.quantity; break;
              case 5: existingCakeItem.qty5Pound += item.quantity; break;
            }
          }
        });

        return Array.from(cakeItemsMap.values()).map((cakeItem) => {
          const calculatedTotals = calculateCakeItemTotals({
            id: cakeItem.id,
            name: cakeItem.name,
            pricePerPound: cakeItem.pricePerPound,
            qty1Pound: cakeItem.qty1Pound,
            qty2Pound: cakeItem.qty2Pound,
            qty3Pound: cakeItem.qty3Pound,
            qty4Pound: cakeItem.qty4Pound,
            qty5Pound: cakeItem.qty5Pound,
          });
          return {
            ...cakeItem,
            totalPounds: calculatedTotals.totalPounds,
            totalAmount: calculatedTotals.totalAmount,
          };
        });
      })(),
      deposit: order.deposit,
      discount: discount,
      seller: order.advisor, // Assuming advisor is the seller
      competitionType: order.team_id ? "team" : "noteam", // Infer based on team_id presence
      totalPrice: order.totalPrice,
      status: order.status,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      department_id: classroomsData.find((c) => c.id === order.classroom_id)?.department_id || "",
      year_id: classroomsData.find((c) => c.id === order.classroom_id)?.grade_level_id || "",
      user_id: order.user_id,
    };
    const iframe = document.createElement("iframe");
    iframe.style.display = "none";
    document.body.appendChild(iframe);

    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!iframeDoc) {
      console.error("Could not get iframe document.");
      return;
    }

    console.log('Cake Items:', formData.cakeItems);


    iframeDoc.open();
    iframeDoc.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>ใบสั่งซื้อเค้ก</title>
        <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
        <style>
          @page {
            size: A4;
          }
          body {
            font-family: 'Noto Sans Thai', sans-serif;
            margin: 0;
            padding: 0;
            -webkit-print-color-adjust: exact; /* For printing background colors */
            print-color-adjust: exact;
          }
          /* Add any specific print styles here if needed */
        </style>
      </head>
      <body>
        <div id="print-root"></div>
      </body>
      </html>
    `);
    iframeDoc.close();

    const printRoot = iframeDoc.getElementById("print-root");
    if (printRoot) {
      const tempDiv = document.createElement("div");
      printRoot.appendChild(tempDiv);
      const root = ReactDOM.createRoot(tempDiv);
      root.render(
        <PrintableOrderSummaryContent
          formData={formData}
          grandTotal={grandTotal}
          netPayable={netPayable}
          remainingBalance={remainingBalance}
          departmentsData={departmentsData}
          yearsData={yearsData}
          teamsData={teamsData}
          classroomsData={classroomsData}
        />
      );

      iframe.onload = () => {
        setTimeout(() => {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
          document.body.removeChild(iframe);
        }, 500);
      };
    }
  };

  if (!order && !isVisible) {
    return null; // Don't render if no order and not visible (after animation out)
  }

  return (
<div className="fixed inset-0 z-50 overflow-hidden">
      <div
        className="absolute inset-0 bg-black/20"
        onClick={onClose}
      ></div>
      <div
        className={`fixed inset-y-0 right-0 w-full max-w-4xl bg-white dark:bg-background shadow-lg transform transition-transform duration-200 ease-out ${ 
          isVisible ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-border">
          <div>
            <h2 className="text-lg font-medium text-gray-900 dark:text-foreground">
              รายละเอียด
            </h2>
          </div>
          <div className="flex items-center gap-2">
            {showApproveButton && order && order.status === 'pending' && onApprove && (
              <button
                onClick={() => onApprove(order.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                <CheckCircle2 className="w-4 h-4"/>
                เสร็จสิ้น
              </button>
            )}
            {order && order.status !== 'complete' && onMarkAsPickedUp && (
              <button
                onClick={() => onMarkAsPickedUp(order)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                <CheckCircle2 className="w-4 h-4"/>
                จ่ายออเดอร์
              </button>
            )}
            <button
              onClick={handlePrint}
              className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              disabled={loadingData || !order}
            >
              <Printer className="w-4 h-4"/>พิมพ์
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-muted-foreground"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="h-[calc(100%-73px)] overflow-y-auto p-4">
          {loadingData ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-6 h-6 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-2"></div>
                <p className="text-gray-600 dark:text-muted-foreground">กำลังโหลด...</p>
              </div>
            </div>
          ) : (
            order && (
              <PrintableOrderSummaryContent
                formData={(() => {
                  const discount = order.order_items.reduce((total: number, item: OrderItem) => total + (item.pound * item.quantity) * 10, 0); // Fix: order_items

                  const formData: OrderFormState = {
                    id: order.id,
                    book_id: order.book_id,
                    book_number: (order as any).book?.bookNumber,
                    number: order.number,
                    customerName: order.customerName,
                    phone: order.phone,
                    orderDate: new Date(order.orderDate).toISOString().split('T')[0], // Convert Date to string
                    pickup_date: order.pickup_date ? new Date(order.pickup_date).toISOString().split('T')[0] : '',
                    time_type: order.time_type,
                    advisor: order.advisor,
                    department_id: classroomsData.find((c) => c.id === order.classroom_id)?.department_id || "",
                    year_id: classroomsData.find((c) => c.id === order.classroom_id)?.grade_level_id || "",
                    classroom_id: order.classroom_id,
                    team_id: order.team_id,
                    cakeItems: (() => {
                      const cakeItemsMap = new Map<string, any>();

                      // Initialize with all products
                      productsData.forEach((product) => {
                        cakeItemsMap.set(product.id, {
                          id: product.id,
                          name: product.name,
                          pricePerPound: Math.round(product.price),
                          qty1Pound: 0,
                          qty2Pound: 0,
                          qty3Pound: 0,
                          qty4Pound: 0,
                          qty5Pound: 0,
                          totalPounds: 0,
                          totalAmount: 0,
                        });
                      });

                      // Overlay with order items
                      (order.order_items ?? []).forEach((item: OrderItem) => { // Fix: order_items
                        const existingCakeItem = cakeItemsMap.get(item.product_id);
                        if (existingCakeItem) {
                          const pound = Number(item.pound);
                          switch (pound) {
                            case 1: existingCakeItem.qty1Pound += item.quantity; break;
                            case 2: existingCakeItem.qty2Pound += item.quantity; break;
                            case 3: existingCakeItem.qty3Pound += item.quantity; break;
                            case 4: existingCakeItem.qty4Pound += item.quantity; break;
                            case 5: existingCakeItem.qty5Pound += item.quantity; break;
                          }
                        }
                      });

                      return Array.from(cakeItemsMap.values()).map((cakeItem) => {
                        const calculatedTotals = calculateCakeItemTotals({
                          id: cakeItem.id,
                          name: cakeItem.name,
                          pricePerPound: cakeItem.pricePerPound,
                          qty1Pound: cakeItem.qty1Pound,
                          qty2Pound: cakeItem.qty2Pound,
                          qty3Pound: cakeItem.qty3Pound,
                          qty4Pound: cakeItem.qty4Pound,
                          qty5Pound: cakeItem.qty5Pound,
                        });
                        return {
                          ...cakeItem,
                          totalPounds: calculatedTotals.totalPounds,
                          totalAmount: calculatedTotals.totalAmount,
                        };
                      });
                    })(),
                    deposit: order.deposit,
                    discount: discount,

                    seller: order.advisor, // Assuming advisor is the seller
                    competitionType: order.team_id ? "team" : "noteam", // Infer based on team_id presence
                    totalPrice: order.totalPrice,
                    status: order.status,
                    createdAt: order.createdAt,
                    updatedAt: order.updatedAt,
                  };
                  return formData;
                })()}
                grandTotal={order.totalPrice}
                netPayable={order.totalPrice - (order.order_items ?? []).reduce((total: number, item: OrderItem) => total + (item.pound * item.quantity) * 10, 0)} // Fix: order_items
                remainingBalance={((order.totalPrice ?? 0) - (order.deposit ?? 0) - ((order.order_items && order.order_items.reduce((total: number, item: OrderItem) => total + (item.pound * item.quantity) * 10, 0)) ?? 0))}
                departmentsData={departmentsData}
                yearsData={yearsData}
                teamsData={teamsData}
                classroomsData={classroomsData}
              />
            )
          )}
        </div>
      </div>
    </div>
    
  );
};

export default OfficerPrepareOrderDetailModal;