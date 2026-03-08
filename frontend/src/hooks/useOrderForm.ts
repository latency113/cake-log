import { useState, useEffect } from "react";
import {
  showAlertSuccess,
  showAlertError,
  showAlertInfo,
  showToastError,
  showToastWarning,
} from "../utils/alerts";
import {
  validateCustomerName,
  validatePhoneNumber,
  validateBookNumber,
  validateOrderNumber,
  validateCakeQuantity,
} from "../utils/formValidation";
import type {
  OrderFormState,
  CakeItem,
  InputChangeEvent,
  Product,
  Department as Idepartments,
  Year,
  Team,
  Classroom as Iclassrooms,
  Order,
  FormErrors,
  OrderBook,
} from "../types";
import type { OrderItem } from "../types/orderItem";
import {
  calculateGrandTotal,
  calculateNetPayable,
  calculateRemainingBalance,
  calculateCakeItemTotals,
} from "../utils/calculations";
import {
  createOrder,
  getYears,
  getProducts,
  getClassrooms,
  createOrderItems,
  updateOrder,
  updateOrderItem,
  deleteOrderItem,
  checkOrderExists,
  getOrderBooks,
} from "../utils/api";
import { getTeams } from "../utils/api/teams";
import { getDepartments } from "@/utils/api/departments";
import { useAuth } from "../contexts/AuthContext";

const useOrderForm = (
  initialOrder: Order | null = null,
  onOrderEdited?: () => void, // New prop
  onClose?: () => void,
  initialBookId?: string // New prop
) => {
  const { user } = useAuth();
  const [initialCakeItems, setInitialCakeItems] = useState<CakeItem[]>([]);
  const [originalOrderItems, setOriginalOrderItems] = useState<OrderItem[]>([]); // New state for original order items
  const [loading, setLoading] = useState<boolean>(true);
  const [formData, setFormData] = useState<OrderFormState>(() => {
    if (initialOrder) {
      const pickupDate = new Date(initialOrder.pickup_date);
      const timetype = pickupDate.getUTCHours() < 12 ? "morning" : "afternoon";
      // competitionType will be determined in a useEffect after teamsData is fetched

      return {
        id: initialOrder.id,
        number: initialOrder.number,
        book_id: initialOrder.book?.id || "",
        book_number: initialOrder.book?.bookNumber,
        customerName: initialOrder.customerName,
        deposit: initialOrder.deposit,
        advisor: initialOrder.advisor,
        status: initialOrder.status,
        orderDate: new Date(initialOrder.orderDate).toISOString().split("T")[0],
        phone: initialOrder.phone,
        pickup_date: initialOrder.pickup_date,
        time_type: timetype,
        classroom_id: initialOrder.classroom_id || "",
        team_id: initialOrder.team_id || "",
        totalPrice: initialOrder.totalPrice,
        order_items: initialOrder.order_items,
        cakeItems: [], // Will be populated in useEffect
        discount: 0, // Will be calculated

        seller: initialOrder.user
          ? `${initialOrder.user.firstname} ${initialOrder.user.lastname}`
          : "",
        competitionType: initialOrder.team_id ? "team" : "noteam", // Placeholder, will be accurately set in useEffect
        createdAt: initialOrder.createdAt,
        updatedAt: initialOrder.updatedAt,
      };
    } else {
      const savedSelections = localStorage.getItem("orderFormSelections");
      let initialDepartmentId = "";
      let initialYearId = "";
      let initialClassroomId = "";
      let initialBookIdValue: string = initialBookId || "";
      let initialOrderNumber: string;
      const lastUsedOrderNumber = localStorage.getItem("lastUsedOrderNumber");

      if (savedSelections) {
        try {
          const parsed = JSON.parse(savedSelections);
          initialDepartmentId = parsed.department_id || "";
          initialYearId = parsed.year_id || "";
          initialClassroomId = parsed.classroom_id || "";
          if (!initialBookIdValue) {
            initialBookIdValue = (parsed.book_id || "").toString();
          }
        } catch (err) {
          console.error(
            "Failed to parse saved selections from localStorage:",
            err
          );
        }
      }

      if (lastUsedOrderNumber) {
        const nextNumber = parseInt(lastUsedOrderNumber) + 1;
        const paddingLength = lastUsedOrderNumber.length;
        initialOrderNumber = nextNumber.toString().padStart(paddingLength, "0");
      } else {
        initialOrderNumber = "0"; // Default starting number
      }

      return {
        number: initialOrderNumber.toString(),
        book_id: initialBookIdValue.toString(),
        customerName: "",
        depository: "",
        deposit: 0,
        advisor: "",
        status: "pending",
        orderDate: new Date().toISOString().split("T")[0],
        phone: "",
        pickup_date: new Date().toISOString().split("T")[0],
        time_type: "morning",
        classroom_id: initialClassroomId,
        team_id: "",
        department_id: initialDepartmentId,
        year_id: initialYearId,
        totalPrice: 0,
        orderItems: [],
        cakeItems: [],
        discount: 0,

        seller: "",
        competitionType: "noteam",
      };
    }
  });
  const [departmentsData, setDepartmentsData] = useState<Idepartments[]>([]);
  const [yearsData, setYearsData] = useState<Year[]>([]);
  const [teamsData, setTeamsData] = useState<Team[]>([]);
  const [classroomsData, setClassroomsData] = useState<Iclassrooms[]>([]);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isCheckingNumber, setIsCheckingNumber] = useState(false);
  const [numberError, setNumberError] = useState<string | null>(null);
  const [orderBooksData, setOrderBooksData] = useState<OrderBook[]>([]); // New state

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        const [departmentsData, yearsData, productsData, classroomsData, teamsResponse, booksResponse] = await Promise.all([
          getDepartments(),
          getYears(),
          getProducts(),
          getClassrooms(1, 999), // Fetch all classrooms with large itemsPerPage
          getTeams(), // Fetch teams data here
          getOrderBooks(1, 999), // Fetch all order books
        ]);

        const teamsData = teamsResponse.data; // Extract data from response
        setTeamsData(teamsData); // Set teamsData state
        const books: OrderBook[] = booksResponse.data || [];
        setOrderBooksData(books); // Set orderBooksData state

        if (!productsData) {
          console.error("Products data is undefined.");
          setLoading(false);
          return;
        }

        // Auto-fill number if book_id is already set (e.g. from SelectBookPage or localStorage)
        if (!initialOrder) {
          setFormData(prev => {
            const updated = { ...prev };
            
            // 1. Auto-fill from Teacher Profile
            if (user?.teacher) {
              updated.advisor = user.teacher.name || "";

              // If we already have a book_id (from SelectBookPage or localStorage),
              // find its classroom instead of defaulting to the first one.
              if (updated.book_id) {
                const currentBook = books.find(b => b.id === updated.book_id);
                if (currentBook && currentBook.classroom_id) {
                  updated.classroom_id = currentBook.classroom_id;
                  updated.book_number = currentBook.bookNumber;
                  
                  const room = classroomsData.find((c: Iclassrooms) => c.id === currentBook.classroom_id);
                  if (room) {
                    updated.department_id = room.department_id || "";
                    updated.year_id = room.grade_level_id || "";
                  }
                }
              } 
              // Only if NO book_id is set, default to the first classroom from teacher profile
              else if (user.teacher.classroom && user.teacher.classroom.length > 0) {
                const firstClassroom = user.teacher.classroom[0];
                updated.department_id = firstClassroom.department_id || "";
                updated.year_id = firstClassroom.grade_level_id || "";
                updated.classroom_id = firstClassroom.id || "";

                // Look for a book assigned to this classroom
                const roomBook = books.find(b => b.classroom_id === firstClassroom.id && !b.isClosed);
                if (roomBook) {
                  updated.book_id = roomBook.id;
                  updated.book_number = roomBook.bookNumber;
                }
              }
            }

            // 2. Auto-fill Number from Book (already has logic for updated.book_id)
            if (updated.book_id) {
              const selectedBook = books.find(b => b.id === updated.book_id);
              if (selectedBook) {
                updated.book_number = selectedBook.bookNumber; // Set book_number for display
                const startNum = parseInt(selectedBook.startNumber, 10);
                if (!isNaN(startNum)) {
                  const nextNum = startNum + (selectedBook.currentNumber || 0);
                  updated.number = nextNum.toString().padStart(selectedBook.startNumber.length, '0');
                }
              }
            }
            return updated;
          });
        }

        // Map classrooms to their respective years
        const yearsWithClassrooms = yearsData.map((year: Year) => {
          const associatedClassrooms = classroomsData.filter(
            (classroom: Iclassrooms) => classroom.grade_level_id === year.id
          );
          return { ...year, classrooms: associatedClassrooms };
        });

        let transformedCakeItems: CakeItem[] = [];
        if (initialOrder) {
          // Normalize initialOrder.orderItems to combine quantities for same product_id and pound
          const normalizedOrderItemsMap = new Map<string, OrderItem>();
          initialOrder.order_items.forEach((item) => {
            const key = `${item.product_id}-${item.pound}`;
            if (normalizedOrderItemsMap.has(key)) {
              const existing = normalizedOrderItemsMap.get(key)!;
              existing.quantity += item.quantity;
              existing.subtotal += item.subtotal;
            } else {
              normalizedOrderItemsMap.set(key, { ...item });
            }
          });
          const normalizedOrderItems = Array.from(
            normalizedOrderItemsMap.values()
          );
          setOriginalOrderItems(normalizedOrderItems); // Set normalized original order items
          // Transform initialOrder.orderItems to CakeItem[]
          const cakeItemsMap = new Map<string, CakeItem>();

          productsData.forEach((product: Product) => {
            cakeItemsMap.set(product.id, {
              id: product.id,
              name: product.name,
              pricePerPound: product.price,
              qty1Pound: 0,
              qty2Pound: 0,
              qty3Pound: 0,
              qty4Pound: 0,
              qty5Pound: 0,
              totalPounds: 0,
              totalAmount: 0,
            });
          });

          if (initialOrder.order_items) {
            // Add this check
            initialOrder.order_items.forEach((item) => {
              const cakeItem = cakeItemsMap.get(item.product_id);
              if (cakeItem) {
                if (item.pound === 1) cakeItem.qty1Pound += item.quantity;
                if (item.pound === 2) cakeItem.qty2Pound += item.quantity;
                if (item.pound === 3) cakeItem.qty3Pound += item.quantity;
                if (item.pound === 4) cakeItem.qty4Pound += item.quantity;
                if (item.pound === 5) cakeItem.qty5Pound += item.quantity;
              }
            });
          }
          console.log("Array object in useOrderForm:", Array); // Debugging line
          transformedCakeItems = Array.from(cakeItemsMap.values()).map(
            calculateCakeItemTotals
          );
        } else {
          setOriginalOrderItems([]); // Add this line to reset originalOrderItems for new orders
          // Existing logic for new order
          transformedCakeItems = productsData.map((product: Product) => ({
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
          }));
        }

        setInitialCakeItems(transformedCakeItems);
        setFormData((prev) => {
          const newState = { ...prev, cakeItems: transformedCakeItems };

          if (initialOrder) {
            const initialClassroom = classroomsData.find(
              (c: Iclassrooms) => c.id === initialOrder.classroom_id
            );
            if (initialClassroom) {
              newState.department_id = initialClassroom.department_id;
              newState.year_id = initialClassroom.grade_level_id;
            }

            // Set competitionType based on initialOrder and fetched teamsData
            if (initialOrder.team_id) {
              const team = teamsData.find((t: Team) => t.id === initialOrder.team_id);
              if (team) {
                newState.competitionType = team.team_type;
                newState.team_id = initialOrder.team_id; // Explicitly set team_id here
              } else {
                // If team_id exists but team not found, default to 'noteam'
                newState.competitionType = "noteam";
                newState.team_id = ""; // Clear team_id if team is not found
              }
            } else {
              newState.competitionType = "noteam";
              newState.team_id = ""; // Ensure team_id is cleared if no initial team
            }
          }
          return newState;
        });
        setDepartmentsData(departmentsData.data);
        setYearsData(yearsWithClassrooms); // Use the combined data
        setClassroomsData(classroomsData); // Keep this for other uses if needed
      } catch (error) {
        console.error("Error fetching initial data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, [initialOrder, user]); // Added user to dependencies



  useEffect(() => {
    const totalPounds = formData.cakeItems.reduce(
      (sum, item) => sum + (item.totalPounds || 0),
      0
    );
    const calculatedDiscount = totalPounds * 10;
    setFormData((prev) => ({ ...prev, discount: calculatedDiscount }));
  }, [formData.cakeItems]);

  // Auto-fill number when book data becomes available or book_id is set initially
  useEffect(() => {
    if (!initialOrder && formData.book_id && orderBooksData.length > 0) {
        // Only auto-fill if number is empty or seems to be a default "0" or "1" (heuristic)
        // or just force it if it matches the book's logic.
        // Let's safe check: if number is present, we might not want to overwrite if user typed it.
        // But for initial load from "Select Book", we want to overwrite.
        // Let's check if the current number is valid for the book.
        
        const book = orderBooksData.find(b => b.id === formData.book_id);
        if (book) {
            const startNum = parseInt(book.startNumber, 10);
            if (!isNaN(startNum)) {
                const nextNum = startNum + (book.currentNumber || 0);
                const nextNumStr = nextNum.toString().padStart(book.startNumber.length, '0');
                
                setFormData(prev => {
                    let nextState = { ...prev };
                    let changed = false;

                    // Sync Book Number for display
                    if (prev.book_number !== book.bookNumber) {
                        nextState.book_number = book.bookNumber;
                        changed = true;
                    }

                    // Sync Order Number
                    if (!prev.number || prev.number === "0" || prev.number === "1" || (initialBookId && prev.book_id === initialBookId)) {
                        if (prev.number !== nextNumStr) {
                            nextState.number = nextNumStr;
                            changed = true;
                        }
                    }

                    // IMPORTANT: Sync Classroom/Year/Dept from the book's assignment
                    if (book.classroom_id && prev.classroom_id !== book.classroom_id) {
                        nextState.classroom_id = book.classroom_id;
                        
                        // Find the classroom details to get year/dept
                        const roomDetails = classroomsData.find((c: Iclassrooms) => c.id === book.classroom_id);
                        if (roomDetails) {
                            nextState.department_id = roomDetails.department_id;
                            nextState.year_id = roomDetails.grade_level_id;
                        }
                        changed = true;
                    }

                    return changed ? nextState : prev;
                });
            }
        }
    }
  }, [orderBooksData, formData.book_id, initialOrder, initialBookId]);

  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);

  useEffect(() => {
    // Only run this effect after initial data has been loaded
    if (loading) return;

    // Clear year_id and classroom_id if department_id changes and they are no longer valid
    if (formData.department_id) {
      const departmentExists = departmentsData.some(
        (dep) => dep.id === formData.department_id
      );
      if (!departmentExists) {
        setFormData((prev) => ({
          ...prev,
          department_id: "",
          year_id: "",
          classroom_id: "",
        }));
        return;
      }
    }

    if (formData.year_id) {
      const yearIsValidForDepartment = yearsData.some(
        (year) =>
          year.id === formData.year_id &&
          year.classrooms?.some(
            (cls) => cls.department_id === formData.department_id
          )
      );
      if (!yearIsValidForDepartment) {
        setFormData((prev) => ({ ...prev, year_id: "", classroom_id: "" }));
      }
    }

    if (formData.classroom_id) {
      const classroomIsValidForYearAndDepartment = classroomsData.some(
        (cls) =>
          cls.id === formData.classroom_id &&
          cls.grade_level_id === formData.year_id &&
          cls.department_id === formData.department_id
      );
      if (!classroomIsValidForYearAndDepartment) {
        setFormData((prev) => ({ ...prev, classroom_id: "" }));
      }
    }
  }, [
    formData.department_id,
    formData.year_id,
    formData.classroom_id,
    departmentsData,
    yearsData,
    classroomsData,
    loading,
  ]);

  const handleGeneralInfoChange = (e: InputChangeEvent) => {
    const { name, value } = e.target;
    
    // Pre-calculate derived values
    let autoCalculatedNumber: string | null = null;
    
    if (name === "book_id") {
      const selectedBook = orderBooksData.find((b) => b.id === value);
      if (selectedBook) {
        const currentCount = selectedBook.currentNumber || 0;
        // Parse startNumber (e.g. "0001" -> 1)
        const startNum = parseInt(selectedBook.startNumber, 10);
        
        if (!isNaN(startNum)) {
          const nextNum = startNum + currentCount;
          // Pad to match original startNumber length (e.g. 6 -> "0006")
          autoCalculatedNumber = nextNum.toString().padStart(selectedBook.startNumber.length, '0');
        }
      }
    }

    setErrors((prev) => ({ ...prev, [name]: undefined })); // Clear error for the changed field
    
    setFormData((prev) => {
      let updatedFormData = { ...prev };

      if (name === "competitionType") {
        const prevCompetitionType = prev.competitionType;
        updatedFormData = { // Correctly start with the full previous state
          ...prev,
          [name]: value as "team" | "person" | "noteam", // Apply the new competitionType
        };

        // If changing away from "team" where a team was selected, clear team-related fields
        if (prevCompetitionType === "team" && value !== "team" && prev.team_id) {
          updatedFormData.team_id = "";

        }

        // Apply specific clearing logic based on the new competitionType
        if (value === "person") {
          updatedFormData.team_id = ""; // Clear team if competitionType is person
        } else if (value === "team") {
          // updatedFormData.customerName = ""; // Removed clearing of customerName
        } else if (value === "noteam") {
          updatedFormData.team_id = ""; // Clear team if competitionType is noteam
        }
      } else if (name === "pickup_date") {
        updatedFormData = { ...updatedFormData, pickup_date: value };
      } else if (name === "time_type") {
        updatedFormData = {
          ...updatedFormData,
          [name]: value as "morning" | "afternoon",
        };
      }
      else if (name === "classroom_id") {
        updatedFormData = { ...updatedFormData, classroom_id: value };
        // Auto-assign book for this room if exists
        const roomBook = orderBooksData.find(b => b.classroom_id === value && !b.isClosed);
        if (roomBook) {
          updatedFormData.book_id = roomBook.id;
          updatedFormData.book_number = roomBook.bookNumber;
          
          // Re-calculate number
          const startNum = parseInt(roomBook.startNumber, 10);
          if (!isNaN(startNum)) {
            const nextNum = startNum + (roomBook.currentNumber || 0);
            updatedFormData.number = nextNum.toString().padStart(roomBook.startNumber.length, '0');
          }
        }
      }
      else if (name === "book_id") {
        updatedFormData = { ...updatedFormData, book_id: value };
        // Apply auto-calculated number if available
        if (autoCalculatedNumber !== null) {
           updatedFormData.number = autoCalculatedNumber;
        } else if (!value) {
           // If book is deselected/cleared, maybe clear number?
           updatedFormData.number = "";
        }
      } else if (name === "number") {
        updatedFormData = { ...updatedFormData, [name]: value };
      } else {
        updatedFormData = { ...updatedFormData, [name]: value };
      }

      // Reconstruct pickup_date with correct time based on time_type
      const datePart = (updatedFormData.pickup_date ?? "").split("T")[0];
      let timePart = "00:00:00.000Z"; // Default to midnight UTC
      if ((updatedFormData.time_type ?? "") === "morning") {
        timePart = "09:00:00.000Z";
      } else if (updatedFormData.time_type === "afternoon") {
        timePart = "13:00:00.000Z";
      }
      updatedFormData.pickup_date = `${datePart}T${timePart}`;

      return updatedFormData;
    });
  };

  const handleNumberBlur = async (value: string) => {
    if (!validateOrderNumber(value)) {
      return;
    }

    setIsCheckingNumber(true);
    setNumberError(null);

    // ✅ Range and Capacity Check
    if (formData.book_id) {
      const selectedBook = orderBooksData.find(b => b.id === formData.book_id);
      if (selectedBook) {
        // Capacity check for NEW orders
        if (!formData.id && selectedBook.currentNumber >= selectedBook.maxCapacity) {
          const fullError = `เล่มที่ ${selectedBook.bookNumber} เต็มแล้ว (กรอกครบแล้ว) ไม่สามารถเพิ่มออเดอร์ใหม่ได้`;
          setNumberError(fullError);
          showAlertError({ 
            title: "เล่มนี้กรอกครบแล้ว", 
            text: fullError 
          });
          
          setFormData(prev => ({ ...prev, book_id: "", number: "" }));
          setIsCheckingNumber(false);
          return;
        }

        const num = parseInt(value, 10);
        const start = parseInt(selectedBook.startNumber, 10);
        const end = parseInt(selectedBook.endNumber, 10);

        if (num < start || num > end) {
          const isOver = num > end;
          const rangeError = isOver 
            ? `เลขที่ ${value} เกินกำหนดของเล่มนี้ (กรอกครบแล้ว)` 
            : `เลขที่ต้องอยู่ในช่วง ${selectedBook.startNumber} - ${selectedBook.endNumber}`;
          
          setNumberError(rangeError);
          showAlertError({ 
            title: isOver ? "เล่มนี้กรอกครบแล้ว" : "เลขที่อยู่นอกช่วง", 
            text: rangeError 
          });

          // Reset the fields to force re-selection
          setFormData(prev => ({ 
            ...prev, 
            number: "",
            book_id: isOver ? "" : prev.book_id // Clear book_id only if it's full
          }));
          
          setIsCheckingNumber(false);
          return;
        }
      }
    }

    try {
      const data = await checkOrderExists(value, formData.id);
      if (data) {
        const errorMessage = `เลขที่ ${value} มีอยู่ในระบบอยู่แล้ว`;
        setNumberError(errorMessage);
        showToastWarning({ text: errorMessage }); // Use showToastWarning for consistency
      } else {
        setNumberError(null); // Clear error if number is available
      }
    } catch (error) {
      console.error("Error checking order number:", error);
      setNumberError("ไม่สามารถตรวจสอบเลขที่ได้");
      showToastError({ text: "เกิดข้อผิดพลาดในการตรวจสอบเลขที่" });
    } finally {
      setIsCheckingNumber(false);
    }
  };

  const handleCakeQuantityChange = (
    cakeId: string,
    field: keyof CakeItem,
    value: number
  ) => {
    setFormData((prev) => {
      const updatedCakeItems = prev.cakeItems.map((item) => {
        if (item.id === cakeId) {
          const updatedItem = calculateCakeItemTotals({
            ...item,
            [field]: value,
          });
          return updatedItem;
        }
        return item;
      });
      return { ...prev, cakeItems: updatedCakeItems };
    });
  };

  const grandTotal = calculateGrandTotal(formData.cakeItems);
  const netPayable = calculateNetPayable(grandTotal, formData.discount);
  const remainingBalance = calculateRemainingBalance(
    netPayable,
    formData.deposit
  );

  const handleDepositAmountChange = (e: InputChangeEvent) => {
    const { value } = e.target;
    const parsedValue = parseFloat(value);
    const nonNegativeDeposit =
      isNaN(parsedValue) || parsedValue < 0 ? 0 : parsedValue;
    const cappedDeposit = Math.min(nonNegativeDeposit, netPayable);
    setFormData((prev) => ({ ...prev, deposit: cappedDeposit }));
  };

  const resetForm = () => {
    const savedSelections = localStorage.getItem("orderFormSelections");

    let initialDepartmentId = "";

    let initialYearId = "";

    let initialClassroomId = "";

    let initialBookId: string = "";

    let initialOrderNumber: string;

    if (savedSelections) {
      try {
        const parsed = JSON.parse(savedSelections);

        initialDepartmentId = parsed.department_id || "";

        initialYearId = parsed.year_id || "";

        initialClassroomId = parsed.classroom_id || "";

        initialBookId = (parsed.book_id || 0).toString();
      } catch (err) {
        console.error(
          "Failed to parse saved selections from localStorage during reset:",
          err
        );
      }
    }

    // Auto-increment logic for order number during reset

    const lastUsedOrderNumber = localStorage.getItem("lastUsedOrderNumber");

    if (lastUsedOrderNumber) {
      const nextNumber = parseInt(lastUsedOrderNumber) + 1;

      const paddingLength = lastUsedOrderNumber.length;

      initialOrderNumber = nextNumber.toString().padStart(paddingLength, "0");
    } else {
      initialOrderNumber = "1"; // Default starting number
    }

    setFormData({
      customerName: "",

      classroom_id: initialClassroomId,

      orderDate: new Date().toISOString().split("T")[0],

      totalPrice: 0,

      book_id: initialBookId,

      number: initialOrderNumber,
      phone: "",
      pickup_date: new Date().toISOString().split("T")[0],
      time_type: "morning",
      deposit: 0,
      advisor: user?.teacher?.name || "",
      status: "pending",
      cakeItems: initialCakeItems.map(calculateCakeItemTotals),
      discount: 0,
      seller: "",
      competitionType: "noteam",
      department_id: initialDepartmentId,
      year_id: initialYearId,
      ...(formData.competitionType === "noteam" ||
      formData.competitionType === "person"
        ? { team_id: undefined }
        : { team_id: "" }),
    });
  };

  const handleCloseSummaryModal = () => {
    setIsSummaryModalOpen(false);
  };

  const handleConfirmSubmit = async () => {
    setIsSummaryModalOpen(false); // Close modal immediately on confirm

          try {
            const orderItemsPayload = formData.cakeItems.flatMap((product) => {
              if (!product) return [];
    
              const itemsToCreate: OrderItem[] = [];
    
              const findExistingOrderItemId = (
                productId: string,
                pound: number,
                existingItems: OrderItem[]
              ): string | undefined => {
                const found = existingItems.find(
                  (item) => item.product_id === productId && item.pound === pound
                );
                return found?.id;
              };
    
              if (product.qty1Pound > 0) {
                const baseItem = {
                  product_id: product.id,
                  pound: 1,
                  quantity: product.qty1Pound,
                  unitPrice: Math.round(product.pricePerPound),
                  subtotal: Math.round(product.pricePerPound) * 1 * product.qty1Pound,
                  createdAt: "",
                  updatedAt: "",
                };
                if (initialOrder) {
                  itemsToCreate.push({
                    id: findExistingOrderItemId(product.id, 1, originalOrderItems),
                    order_id: initialOrder.id!,
                    ...baseItem,
                  });
                } else {
                  itemsToCreate.push(baseItem);
                }
              }
              if (product.qty2Pound > 0) {
                const baseItem = {
                  product_id: product.id,
                  pound: 2,
                  quantity: product.qty2Pound,
                  unitPrice: Math.round(product.pricePerPound),
                  subtotal: Math.round(product.pricePerPound) * 2 * product.qty2Pound,
                  createdAt: "",
                  updatedAt: "",
                };
                if (initialOrder) {
                  itemsToCreate.push({
                    id: findExistingOrderItemId(product.id, 2, originalOrderItems),
                    order_id: initialOrder.id!,
                    ...baseItem,
                  });
                } else {
                  itemsToCreate.push(baseItem);
                }
              }
              if (product.qty3Pound > 0) {
                const baseItem = {
                  product_id: product.id,
                  pound: 3,
                  quantity: product.qty3Pound,
                  unitPrice: Math.round(product.pricePerPound),
                  subtotal: Math.round(product.pricePerPound) * 3 * product.qty3Pound,
                  createdAt: "",
                  updatedAt: "",
                };
                if (initialOrder) {
                  itemsToCreate.push({
                    id: findExistingOrderItemId(product.id, 3, originalOrderItems),
                    order_id: initialOrder.id!,
                    ...baseItem,
                  });
                } else {
                  itemsToCreate.push(baseItem);
                }
              }
              if (product.qty4Pound > 0) {
                const baseItem = {
                  product_id: product.id,
                  pound: 4,
                  quantity: product.qty4Pound,
                  unitPrice: Math.round(product.pricePerPound),
                  subtotal: Math.round(product.pricePerPound) * 4 * product.qty4Pound,
                  createdAt: "",
                  updatedAt: "",
                };
                if (initialOrder) {
                  itemsToCreate.push({
                    id: findExistingOrderItemId(product.id, 4, originalOrderItems),
                    order_id: initialOrder.id!,
                    ...baseItem,
                  });
                } else {
                  itemsToCreate.push(baseItem);
                }
              }
              if (product.qty5Pound > 0) {
                const baseItem = {
                  product_id: product.id,
                  pound: 5,
                  quantity: product.qty5Pound,
                  unitPrice: Math.round(product.pricePerPound),
                  subtotal: Math.round(product.pricePerPound) * 5 * product.qty5Pound,
                  createdAt: "",
                  updatedAt: "",
                };
                if (initialOrder) {
                  itemsToCreate.push({
                    id: findExistingOrderItemId(product.id, 5, originalOrderItems),
                    order_id: initialOrder.id!,
                    ...baseItem,
                  });
                } else {
                  itemsToCreate.push(baseItem);
                }
              }
    
              return itemsToCreate;
            });
    
            type OrderCreatePayload = Omit<Order, "order_items"> & {
              order_items: OrderItem[];
            }; // Ensure order_items is always an array
            const orderData: OrderCreatePayload = {
              customerName: formData.customerName,
              classroom_id: formData.classroom_id,
              team_id: formData.team_id,
              orderDate: new Date(formData.orderDate).toISOString(),
              totalPrice: grandTotal,
              book_id: formData.book_id,
              number: formData.number,
              phone: formData.phone,
              pickup_date: new Date(formData.pickup_date).toISOString(),
              time_type: formData.time_type || "morning",
              deposit: formData.deposit,
              advisor: formData.advisor,
              status: formData.status,
              order_items: orderItemsPayload as OrderItem[], // Always include order_items
              id: formData.id ?? "",
              createdAt: formData.createdAt ?? "",
              updatedAt: formData.updatedAt ?? "",
              user_id: user?.id || "", // Add user_id here
              officer_prepare_id: initialOrder?.officer_prepare_id,
              officer_pickup_id: initialOrder?.officer_pickup_id,
            };
    
            if (initialOrder) {
              orderData.order_items = orderItemsPayload; // Only include order_items for updates
            }
    
            if (formData.competitionType === "noteam") {
              delete orderData.team_id;
            }
    
            let newOrder: Order; // Explicitly type newOrder as Order
            if (initialOrder) {
              // Update existing order
              newOrder = await updateOrder(initialOrder.id!, orderData);
              // Reconciliation logic for order items
              // Create maps for easier lookup by product_id and pound
              const originalItemsByProductAndPound = new Map<string, OrderItem>();
              originalOrderItems.forEach((item) => {
                originalItemsByProductAndPound.set(
                  `${item.product_id}-${item.pound}`,
                  item
                );
              });
    
              const currentItemsByProductAndPound = new Map<string, OrderItem>();
              orderItemsPayload.forEach((item) => {
                currentItemsByProductAndPound.set(
                  `${item.product_id}-${item.pound}`,
                  item
                );
              });
    
              // 1. Identify and delete items that are no longer present
              for (const originalItem of originalOrderItems) {
                const key = `${originalItem.product_id}-${originalItem.pound}`;
                if (!currentItemsByProductAndPound.has(key)) {
                  if (originalItem.id) {
                    await deleteOrderItem(originalItem.id);
                  }
                }
              }
    
              // 2. Identify and create/update items
              for (const currentItem of orderItemsPayload) {
                const key = `${currentItem.product_id}-${currentItem.pound}`;
                const existingOriginalItem = originalItemsByProductAndPound.get(key);
    
                if (existingOriginalItem && existingOriginalItem.id) {
                  // Item exists, so update it if quantity or other relevant fields changed
                  // For simplicity, we'll always update if it exists, assuming some change
                  await updateOrderItem(existingOriginalItem.id, {
                    order_id: initialOrder.id!,
                    product_id: currentItem.product_id,
                    pound: currentItem.pound,
                    quantity: currentItem.quantity,
                    unitPrice: currentItem.unitPrice,
                    subtotal: currentItem.subtotal,
                  });
                } else {
                  // Item is new, so create it
                  const itemWithoutId = currentItem; // id is not needed for creation
                  await createOrderItems({
                    ...itemWithoutId,
                    order_id: initialOrder.id!,
                  });
                }
              }
            } else {
              // Create new order
              newOrder = await createOrder(orderData);
            }
    
            console.log("New Order Object:", newOrder);
            const orderId = newOrder.id; // Access id directly, as newOrder is now typed as Order
            if (!orderId) {
              throw new Error("ไม่สามารถดึงรหัสคำสั่งซื้อหลังจากการสร้าง/อัปเดตได้");
            }
    
            if (!initialOrder) {
              // Only create order items for new orders
              const finalOrderItemsPayload = orderItemsPayload.map((item) => ({
                ...item,
                order_id: orderId,
              }));
    
              for (const item of finalOrderItemsPayload) {
                const itemWithoutId = item;
                await createOrderItems({ ...itemWithoutId, order_id: orderId });
              }
              // Save the newly created order number for auto-increment
              localStorage.setItem("lastUsedOrderNumber", newOrder.number.toString());
            }
    
            showAlertSuccess({
              title: initialOrder ? "อัปเดตสำเร็จ!" : "บันทึกสำเร็จ!",
              text: initialOrder
                ? "คำสั่งซื้อถูกอัปเดตเรียบร้อยแล้ว"
                : "คำสั่งซื้อถูกบันทึกเรียบร้อยแล้ว",
            });
    

    
            try {
              resetForm();
            } catch (resetError) {
              console.error("Error during resetForm:", resetError);
              // Optionally, show a less critical alert for reset errors
            }
    
            if (initialOrder && onOrderEdited) onOrderEdited(); // Call callback after successful edit
            if (onClose) onClose(); // Close modal if provided
          } catch (error: unknown) {
      // Handle unknown error type safely
      console.error("Error submitting form:", error);
      let errorMessage =
        "เกิดข้อผิดพลาดในการบันทึก/อัปเดตคำสั่งซื้อ กรุณาลองใหม่อีกครั้ง";
      let errorTitle = "เกิดข้อผิดพลาด!";

      if (
        typeof error === 'object' &&
        error !== null &&
        'response' in error &&
        typeof (error as any).response === 'object' &&
        (error as any).response !== null &&
        'status' in (error as any).response &&
        (error as any).response.status === 409
      ) {
        errorMessage =
          (error as any).response.data || "เลขที่คำสั่งซื้อนี้มีอยู่ในระบบแล้ว";
        errorTitle = "เลขที่ซ้ำ!";
      }

      showAlertError({
        title: errorTitle,
        text: errorMessage,
      });
      // Log the full error object for debugging
      console.error("Full error details:", JSON.stringify(error, null, 2));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setErrors({}); // Clear all previous errors

    const newErrors: FormErrors = {};
    let hasError = false;

    if (!validateCustomerName(formData.customerName)) {
      newErrors.customerName = "กรุณากรอกชื่อลูกค้า";
      hasError = true;
    }

    if (!validatePhoneNumber(formData.phone)) {
      newErrors.phone = "กรุณากรอกเบอร์โทรศัพท์ที่ถูกต้อง";
      hasError = true;
    }

    if (!validateBookNumber(formData.book_id)) {
      newErrors.book_id = "กรุณากรอกเล่มที่";
      hasError = true;
    }

    if (!validateOrderNumber(formData.number)) {
      newErrors.number = "กรุณากรอกเลขที่";
      hasError = true;
    }

    const totalCakePounds = formData.cakeItems.reduce(
      (sum, item) => sum + (item.totalPounds || 0),
      0
    );
    if (!validateCakeQuantity(totalCakePounds)) {
      newErrors.cakeItems = "กรุณาเพิ่มรายการเค้กอย่างน้อย 1 รายการ";
      hasError = true;
    }

    // Re-check number error before submission
    if (formData.number && !numberError) {
      await handleNumberBlur(formData.number.toString());
      // After re-checking, if numberError is now set, prevent submission
      if (numberError) {
        console.log(
          "handleSubmit: Preventing submission due to numberError:",
          numberError
        );
        showToastError({
          text: numberError || "กรุณากรอกข้อมูลให้ครบถ้วนและถูกต้อง",
        });
        return;
      }
    }

    if (hasError || numberError) {
      // Keep this check for other errors
      setErrors(newErrors);
      showToastError({
        text: numberError || "กรุณากรอกข้อมูลให้ครบถ้วนและถูกต้อง",
      });
      return;
    }

    // Check if classroom order is finalized
    if (formData.classroom_id) {
      const selectedClassroom = classroomsData.find(c => c.id === formData.classroom_id);
      if (selectedClassroom?.isOrderFinalized) {
        // Allow ADMIN and SUPERADMIN to bypass
        if (user?.role !== "ADMIN" && user?.role !== "SUPERADMIN") {
          showAlertError({
            title: "ไม่สามารถบันทึกได้",
            text: "ห้องเรียนนี้ได้ทำการสรุปยอดออเดอร์ไปแล้ว ไม่สามารถเพิ่มรายการใหม่ได้",
          });
          return;
        }
      }
    }

    setIsSummaryModalOpen(true); // Open the summary modal
  };

  const handleCancel = () => {
    resetForm();
    showAlertInfo({
      title: "ยกเลิกฟอร์ม",
      text: "ฟอร์มถูกยกเลิกและรีเซ็ตเรียบร้อยแล้ว",
    });
  };

  return {
    formData,
    loading,
    departmentsData,
    yearsData,
    teamsData,
    classroomsData,
    grandTotal,
    netPayable,
    remainingBalance,
    handleGeneralInfoChange,
    handleCakeQuantityChange,
    handleDepositAmountChange,
    handleSubmit,
    handleConfirmSubmit,
    handleCloseSummaryModal,
    isSummaryModalOpen,
    handleCancel,
    errors,
    isCheckingNumber,
    numberError,
    handleNumberBlur,
    orderBooks: orderBooksData,
  };
};

export default useOrderForm;
