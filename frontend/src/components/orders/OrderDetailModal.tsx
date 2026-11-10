import React, { useState, useEffect, useCallback } from "react";
import type {
  Order,
  Year,
  Team,
  Classroom,
  Department,
  OrderFormState,
  User, // Import User type
} from "../../types";
import type { OrderItem } from "../../types/orderItem";
import type { Product } from "../../types/product";
import ReactDOM from "react-dom/client";
import { getYears, getClassrooms, getProducts } from "../../utils/api";
import { calculateCakeItemTotals } from "../../utils/calculations";
import { getTeams } from "../../utils/api/teams";
import { getDepartments } from "../../utils/api/departments";
import PrintableOrderSummaryContent from "./PrintableOrderSummaryContent";

import {
  Printer,
  CheckCircle2,
  Edit,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"; // Import Edit, ChevronLeft, ChevronRight icons

const defaultProducts = [
  { id: "1", name: "เค้กเนยสด", price: 190 },
  { id: "2", name: "เค้กแยม", price: 200 },
  { id: "3", name: "เค้กกาแฟ", price: 200 },
  { id: "4", name: "เค้กช็อกโกแลต", price: 250 },
];

const buildCakeItemsForOrder = (
  orderItems: OrderItem[] | undefined,
  products: Product[]
) => {
  const cakeItemsMap = new Map<string, any>();
  const productsToUse = products.length > 0 ? products : defaultProducts;

  productsToUse.forEach((product) => {
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

  (orderItems ?? []).forEach((item: OrderItem) => {
    let existingCakeItem = cakeItemsMap.get(item.product_id);
    if (!existingCakeItem && item.productName) {
      const pName = item.productName;
      existingCakeItem = Array.from(cakeItemsMap.values()).find(
        (c) => c.name === pName || pName.includes(c.name)
      );
    }

    if (existingCakeItem) {
      const pound = Number(item.pound);
      switch (pound) {
        case 1:
          existingCakeItem.qty1Pound += item.quantity;
          break;
        case 2:
          existingCakeItem.qty2Pound += item.quantity;
          break;
        case 3:
          existingCakeItem.qty3Pound += item.quantity;
          break;
        case 4:
          existingCakeItem.qty4Pound += item.quantity;
          break;
        case 5:
          existingCakeItem.qty5Pound += item.quantity;
          break;
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
};

interface OrderDetailModalProps {
  order: (Order & { departmentName?: string; time_type?: string }) | null;
  onClose: () => void;
  onMarkAsPickedUp?: (order: Order) => void;
  onApprove?: (orderId: string) => void; // New prop
  showApproveButton?: boolean; // New prop
  isOpen?: boolean;
  onEditOrder?: (order: Order) => void; // New prop for editing
  currentUser?: User | null; // New prop for the current user
  orderList?: Order[]; // New prop for list of orders for navigation
  currentOrderIndex?: number; // New prop for current order index in the list
  onNavigate?: (newIndex: number) => void; // New prop for navigation handler
}

const OrderDetailModal: React.FC<OrderDetailModalProps> = ({
  order,

  onClose,

  onMarkAsPickedUp,

  onApprove,

  showApproveButton,

  onEditOrder,

  currentUser,

  orderList,

  currentOrderIndex,

  onNavigate,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  const [yearsData, setYearsData] = useState<Year[]>([]);

  const [teamsData, setTeamsData] = useState<Team[]>([]);

  const [classroomsData, setClassroomsData] = useState<Classroom[]>([]);

  const [departmentsData, setDepartmentsData] = useState<Department[]>([]);

  const [productsData, setProductsData] = useState<Product[]>([]);

  const [loadingData, setLoadingData] = useState(true);

  // New states for navigation animation

  const [isSlidingOut, setIsSlidingOut] = useState(false);
  const [displayedOrder, setDisplayedOrder] = useState<Order | null>(null);

  const fetchData = useCallback(async () => {
    setLoadingData(true);

    try {
      const years = await getYears();

      const classrooms = await getClassrooms(1, 999);

      const departments = await getDepartments();

      const teams = await getTeams();

      const products = await getProducts();

      setYearsData(years);

      setTeamsData(teams.data);

      setClassroomsData(classrooms);

      setDepartmentsData(departments.data);

      setProductsData(products);
    } catch (error) {
      console.error("Error fetching data for OrderDetailModal:", error);
    } finally {
      setLoadingData(false);

      // After data is loaded for the new displayed order, ensure slide-out is false for next navigation

      setIsSlidingOut(false); // Reset for next animation
    }
  }, []); // Dependencies of useCallback

  useEffect(() => {
    if (order) {
      setIsVisible(true);

      // If the incoming order prop is different from what's currently displayed,

      // it means a navigation event occurred. We need to fetch data for the new order.

      if (!displayedOrder || order.id !== displayedOrder.id) {
        setDisplayedOrder(order); // Set the new order to be displayed
        fetchData();
      } else if (order.id === displayedOrder.id && loadingData) {
        fetchData();
      }
    } else {
      setIsVisible(false);

      const timer = setTimeout(() => {
        if (!order) {
          onClose();
        }
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [order, onClose, displayedOrder, fetchData, loadingData]);

  const handleNavigation = (direction: "left" | "right") => {
    if (isSlidingOut || loadingData) return; // Prevent navigation during slide-out or loading

    setIsSlidingOut(true); // Start slide-out animation

    setTimeout(() => {
      // After slide-out animation duration, trigger parent navigation

      if (
        direction === "left" &&
        onNavigate &&
        currentOrderIndex !== undefined &&
        orderList &&
        currentOrderIndex > 0
      ) {
        onNavigate(currentOrderIndex - 1);
      } else if (
        direction === "right" &&
        onNavigate &&
        currentOrderIndex !== undefined &&
        orderList &&
        currentOrderIndex < orderList.length - 1
      ) {
        onNavigate(currentOrderIndex + 1);
      }
    }, 200); // Match CSS transition duration
  };

  const handlePrint = () => {
    if (!displayedOrder || loadingData) return;

    // Calculate props for PrintableOrderSummary
    const discount = (displayedOrder.order_items ?? []).reduce(
      (total: number, item: OrderItem) =>
        total + item.pound * item.quantity * 10,
      0
    );
    const grandTotal = displayedOrder.totalPrice;
    const netPayable = grandTotal - discount;
    const remainingBalance = Math.max(0, netPayable - displayedOrder.deposit);

    const formData: OrderFormState = {
      ...displayedOrder,
      orderDate: new Date(displayedOrder.orderDate).toISOString().split("T")[0],
      pickup_date: displayedOrder.pickup_date
        ? new Date(displayedOrder.pickup_date).toISOString().split("T")[0]
        : "",
      time_type: displayedOrder.time_type,
      book_number: displayedOrder.book?.bookNumber,
      cakeItems: buildCakeItemsForOrder(
        displayedOrder.order_items,
        productsData
      ),
      discount: discount,
      seller: displayedOrder.advisor,
      competitionType: displayedOrder.team_id ? "team" : "noteam",
      totalPrice: displayedOrder.totalPrice,
      status: displayedOrder.status,
      createdAt: displayedOrder.createdAt,
      updatedAt: displayedOrder.updatedAt,
      department_id:
        classroomsData.find((c) => c.id === displayedOrder.classroom_id)
          ?.department_id || "",
      year_id:
        classroomsData.find((c) => c.id === displayedOrder.classroom_id)
          ?.grade_level_id || "",
      user_id: displayedOrder.user_id,
    };

    const iframe = document.createElement("iframe");
    iframe.style.position = "absolute";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "none";
    iframe.style.left = "-9999px";
    document.body.appendChild(iframe);

    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!iframeDoc) {
      console.error("Could not get iframe document.");
      document.body.removeChild(iframe);
      return;
    }

    iframeDoc.open();
    iframeDoc.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>ใบสั่งจองเค้ก - ${formData.customerName || ""}</title>
        <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
        <style>
          @page {
            size: A4 portrait;
            margin: 0;
          }
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
            box-sizing: border-box;
          }
          body {
            font-family: 'Noto Sans Thai', 'Sarabun', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 8mm 12mm;
            background-color: #ffffff !important;
            color: #000000 !important;
          }
          /* ตั้งค่าการพิมพ์เป็นขาวดำ */
          table, th, td {
            border-color: #000000 !important;
            color: #000000 !important;
          }
          .border-b {
            border-bottom-color: #000000 !important;
          }
          * {
            color: #000000 !important;
          }
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
          isBlackAndWhite={true}
        />
      );

      setTimeout(() => {
        try {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
        } catch (e) {
          console.error("Print error:", e);
        } finally {
          setTimeout(() => {
            if (document.body.contains(iframe)) {
              document.body.removeChild(iframe);
            }
          }, 1500);
        }
      }, 500);
    }
  };

  if (!order && !isVisible) {
    return null; // Don't render if no order and not visible (after animation out)
  }

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black/20" onClick={onClose}></div>
      <div
        className={`fixed inset-y-0 right-0 w-full max-w-4xl bg-white dark:bg-background shadow-lg transform transition-transform duration-200 ease-out ${
          isVisible ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-border">
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleNavigation("left")}
              disabled={
                currentOrderIndex === 0 ||
                !orderList ||
                orderList.length === 0 ||
                isSlidingOut ||
                loadingData
              }
              className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-muted-foreground disabled:opacity-50"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-medium text-gray-900 dark:text-foreground">
              รายละเอียด
            </h2>
            <button
              onClick={() => handleNavigation("right")}
              disabled={
                currentOrderIndex === (orderList?.length ?? 0) - 1 ||
                !orderList ||
                orderList.length === 0 ||
                isSlidingOut ||
                loadingData
              }
              className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-muted-foreground disabled:opacity-50"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          <div className="flex items-center gap-2">
            {onEditOrder &&
              displayedOrder &&
              currentUser &&
              displayedOrder.user_id === currentUser.id && ( // Conditionally render edit button
                <button
                  onClick={() => onEditOrder(displayedOrder)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  แก้ไข
                </button>
              )}
            {showApproveButton &&
              displayedOrder &&
              displayedOrder.status === "pending" &&
              onApprove && (
                <button
                  onClick={() => onApprove(displayedOrder.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  เสร็จสิ้น
                </button>
              )}
            {displayedOrder &&
              displayedOrder.status !== "complete" &&
              onMarkAsPickedUp && (
                <button
                  onClick={() => onMarkAsPickedUp(displayedOrder)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  จ่ายออเดอร์
                </button>
              )}
            <button
              onClick={handlePrint}
              className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              disabled={loadingData || !displayedOrder}
              title="พิมพ์ใบสั่งจองเค้ก (ขาวดำ A4 แนวตั้ง)"
            >
              <Printer className="w-4 h-4" />
              พิมพ์
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-muted-foreground"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        <div
          className={`h-[calc(100%-73px)] overflow-y-auto p-4 relative
            transition-opacity duration-200 ease-in-out
            ${isSlidingOut ? "opacity-0" : "opacity-100"}`}
        >
          {loadingData ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-6 h-6 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-2"></div>
                <p className="text-gray-600 dark:text-muted-foreground">
                  กำลังโหลด...
                </p>
              </div>
            </div>
          ) : (
            displayedOrder && ( // Use displayedOrder for rendering content
              <PrintableOrderSummaryContent
                formData={(() => {
                  const discount = (displayedOrder.order_items ?? []).reduce(
                    (total: number, item: OrderItem) =>
                      total + item.pound * item.quantity * 10,
                    0
                  ); // Fix: order_items

                  const formData: OrderFormState = {
                    id: displayedOrder.id,
                    book_id: displayedOrder.book_id,
                    book_number: displayedOrder.book?.bookNumber,
                    number: displayedOrder.number,
                    customerName: displayedOrder.customerName,
                    phone: displayedOrder.phone,
                    orderDate: new Date(displayedOrder.orderDate)
                      .toISOString()
                      .split("T")[0], // Convert Date to string
                    pickup_date: displayedOrder.pickup_date
                      ? new Date(displayedOrder.pickup_date)
                          .toISOString()
                          .split("T")[0]
                      : "",
                    time_type: displayedOrder.time_type,
                    advisor: displayedOrder.advisor,
                    department_id:
                      classroomsData.find(
                        (c) => c.id === displayedOrder.classroom_id
                      )?.department_id || "",
                    year_id:
                      classroomsData.find(
                        (c) => c.id === displayedOrder.classroom_id
                      )?.grade_level_id || "",
                    classroom_id: displayedOrder.classroom_id,
                    team_id: displayedOrder.team_id,
                    cakeItems: buildCakeItemsForOrder(
                      displayedOrder.order_items,
                      productsData
                    ),
                    deposit: displayedOrder.deposit,
                    discount: discount,
                    seller: displayedOrder.advisor, // Assuming advisor is the seller
                    competitionType: displayedOrder.team_id ? "team" : "noteam", // Infer based on team_id presence
                    totalPrice: displayedOrder.totalPrice,
                    status: displayedOrder.status,
                    createdAt: displayedOrder.createdAt,
                    updatedAt: displayedOrder.updatedAt,
                  };
                  return formData;
                })()}
                grandTotal={displayedOrder.totalPrice}
                netPayable={
                  displayedOrder.totalPrice -
                  (displayedOrder.order_items ?? []).reduce(
                    (total: number, item: OrderItem) =>
                      total + item.pound * item.quantity * 10,
                    0
                  )
                } // Fix: order_items
                remainingBalance={
                  (displayedOrder.totalPrice ?? 0) -
                  (displayedOrder.deposit ?? 0) -
                  ((displayedOrder.order_items &&
                    displayedOrder.order_items.reduce(
                      (total: number, item: OrderItem) =>
                        total + item.pound * item.quantity * 10,
                      0
                    )) ??
                    0)
                }
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

export default OrderDetailModal;
