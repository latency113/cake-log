import { api } from "../api";
import type { DashboardSummary, User, SalesRecord } from "../../types";
import type { Classroom } from "../../types/classroom";
import type { ClassroomCakeSummary } from "../../types/classroomCakeSummary";
import type { Order } from "../../types/order";
import type { Product } from "../../types/product";
import type { Department } from "../../types/department"; // Import Department type
import type { GradeLevel } from "../../types/gradelevel"; // Import GradeLevel type
import type { Teacher } from "../../types/teacher"; // Import Teacher type
import { getDepartments } from "./departments";
import { getAllOrders } from "./orders";
import { getProducts } from "./products";

export const getClassrooms = async (page: number, itemsPerPage: number) => {
  try {
    const response = await api.get(`/classrooms`,{
      params: { page, itemsPerPage },
    });
    return response.data.data;
  } catch (error) {
    console.error("Error fetching classrooms:", error);
    throw error;
  }
};

export const finalizeClassroom = async (classroomId: string) => {
  try {
    const response = await api.patch(`/classrooms/${classroomId}/finalize`);
    return response.data;
  } catch (error) {
    console.error("Error finalizing classroom:", error);
    throw error;
  }
};

export const getYears = async () => {
  try {
    const response = await api.get("/grade-levels");
    return response.data.data;
  } catch (error) {
    console.error("Error fetching years:", error);
    throw error;
  }
};

export const getAllUsers = async (itemsPerPage?: number): Promise<User[]> => {
  try {
    const params: { itemsPerPage?: number } = {};
    if (itemsPerPage !== undefined) {
      params.itemsPerPage = itemsPerPage;
    }
    const response = await api.get(`/users`, { params });
    return response.data.data;
  } catch (error) {
    console.error("Error fetching all users:", error);
    throw error;
  }
};

export const getClassroomCakeSummaries = async (filterUserId?: string): Promise<ClassroomCakeSummary[]> => {
  try {
    let allOrders: Order[] = await getAllOrders(1, 5000); // Fetch all orders
    
    // Filter orders if filterUserId is provided
    if (filterUserId) {
      allOrders = allOrders.filter(order => order.user_id === filterUserId);
    }

    // Sort orders by createdAt in ascending order (oldest first)
    allOrders.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    const allProducts: Product[] = await getProducts(); // Fetch all products
    const allClassrooms: Classroom[] = await getClassrooms(1, 999); // Fetch all classrooms
    const departmentsResponse = await getDepartments(1, 9999); // Fetch all departments
    const allDepartments: Department[] = departmentsResponse.data;
    const allGradeLevels: GradeLevel[] = await getYears(); // Fetch all grade levels
    const { getTeachers } = await import("./teachers"); // Dynamically import getTeachers
    const allTeachers: Teacher[] = await getTeachers(); // Fetch all teachers

    const productMap = new Map<string, Product>(allProducts.map(product => [product.id!, product]));
    const classroomMap = new Map<string, Classroom>(allClassrooms.map(classroom => [classroom.id!, classroom]));
    const departmentMap = new Map<string, Department>(allDepartments.map(department => [department.id, department]));
    const gradeLevelMap = new Map<string, GradeLevel>(allGradeLevels.map(gradeLevel => [gradeLevel.id, gradeLevel]));
    const teacherMap = new Map<string, Teacher>(allTeachers.map(teacher => [teacher.id, teacher])); // Map for teachers

    const classroomSummaryMap = new Map<string, ClassroomCakeSummary>();

    allOrders.forEach(order => {
      if (!order.classroom_id || order.status === "cancelled") {
        return; // Skip orders without a classroom or cancelled orders
      }

      const classroom = classroomMap.get(order.classroom_id);
      if (!classroom) {
        return; // Skip if classroom not found
      }

      const department = departmentMap.get(classroom.department_id);
      const gradeLevel = gradeLevelMap.get(classroom.grade_level_id);
      const teacher = teacherMap.get(classroom.teacher_id);

      const departmentName = department ? department.name : "Unknown Department";
      const gradeLevelName = gradeLevel 
        ? `${gradeLevel.level === "VOCATIONAL" ? "ปวช." : gradeLevel.level === "HIGHER" ? "ปวส." : gradeLevel.level} ${gradeLevel.year}` 
        : "Unknown Year";
      const advisorName = teacher ? teacher.name : "Unknown Advisor";
      const roomNumber = classroom.name; // Assuming classroom.name is the room number

      // Create a unique key for the summary based on department, grade level, and classroom
      const summaryKey = `${departmentName}-${gradeLevelName}-${classroom.name}`;

      if (!classroomSummaryMap.has(summaryKey)) {
        classroomSummaryMap.set(summaryKey, {
          classroomId: classroom.id, // Populate classroomId
          classroomName: classroom.name,
          departmentName: departmentName,
          gradeLevelName: gradeLevelName,
          advisor: advisorName, // Populate advisor
          roomNumber: roomNumber, // Populate room number
          cakeSummaries: [],
          depositAmount: 0, // Initialize deposit amount
          isOrderFinalized: classroom.isOrderFinalized, // Populate isOrderFinalized
          _bookNumbers: new Set<string>(), // Internal temporary storage for book numbers
          _orderNumbers: new Set<string>(), // Internal temporary storage for order numbers
        });
      }

      const currentClassroomSummary = classroomSummaryMap.get(summaryKey)!;
      currentClassroomSummary.depositAmount = (currentClassroomSummary.depositAmount || 0) + order.deposit; // Aggregate deposit amount
      // Add unique book numbers
      if (order.book?.bookNumber) {
        currentClassroomSummary._bookNumbers.add(order.book.bookNumber);
      } else if (order.book_id) {
        currentClassroomSummary._bookNumbers.add(order.book_id); // Fallback
      }
      currentClassroomSummary._orderNumbers.add(order.number); // Collect order number


      order.order_items.forEach(item => {
        const product = productMap.get(item.product_id);
        if (!product) return; // Skip if product not found

        let cakeSummary = currentClassroomSummary.cakeSummaries.find(
          (summary) => summary.productName === product.name
        );

        if (!cakeSummary) {
          cakeSummary = {
            productName: product.name,
            totalPounds: 0,
            totalQuantity: 0,
            pricePerPound: product.price, // Populate price per pound
            totalAmount: 0, // Will be calculated below
            quantityBySize: {},
          };
          currentClassroomSummary.cakeSummaries.push(cakeSummary);
        }

        cakeSummary.totalPounds += item.pound * item.quantity;
        cakeSummary.totalQuantity += item.quantity;
        cakeSummary.quantityBySize[item.pound] = (cakeSummary.quantityBySize[item.pound] || 0) + item.quantity;
        cakeSummary.totalAmount = cakeSummary.totalPounds * cakeSummary.pricePerPound; // Calculate total amount based on pounds
      });
    });

    // After processing all orders, add cakes that were not ordered for each classroom summary
    classroomSummaryMap.forEach(classroomSummary => {
      allProducts.forEach(product => {
        const productFound = classroomSummary.cakeSummaries.some(
          (cake) => cake.productName === product.name
        );

        if (!productFound) {
          classroomSummary.cakeSummaries.push({
            productName: product.name,
            totalPounds: 0,
            totalQuantity: 0,
            pricePerPound: product.price,
            totalAmount: 0,
            quantityBySize: {},
          });
        }
      });
    });

    const sortedSummaries = Array.from(classroomSummaryMap.values()).sort((a, b) => {
      // Sort by Department Name, then Grade Level Name, then Classroom Name
      const departmentCompare = a.departmentName.localeCompare(b.departmentName);
      if (departmentCompare !== 0) return departmentCompare;

      const gradeLevelCompare = a.gradeLevelName.localeCompare(b.gradeLevelName);
      if (gradeLevelCompare !== 0) return gradeLevelCompare;

      return a.classroomName.localeCompare(b.classroomName);
    });
    
    // Sort cakeSummaries within each classroom by product name
    sortedSummaries.forEach(classroomSummary => {
      classroomSummary.cakeSummaries.sort((a, b) => a.productName.localeCompare(b.productName));

      // Generate book number range
      const bookNumbers = Array.from(classroomSummary._bookNumbers).sort();
      if (bookNumbers.length > 0) {
        classroomSummary.bookNumberRange =
          bookNumbers.length === 1
            ? bookNumbers[0]
            : `${bookNumbers[0]} - ${bookNumbers[bookNumbers.length - 1]}`;
      }

      // Generate order number range
      const orderNumbers = Array.from(classroomSummary._orderNumbers).sort();
      if (orderNumbers.length > 0) {
        classroomSummary.orderNumberRange =
          orderNumbers.length === 1
            ? orderNumbers[0]
            : `${orderNumbers[0]} - ${orderNumbers[orderNumbers.length - 1]}`;
      }

      // Clean up temporary properties
      delete (classroomSummary as any)._bookNumbers;
      delete (classroomSummary as any)._orderNumbers;
    });

    return sortedSummaries;
  } catch (error) {
    console.error("Error fetching classroom cake summaries:", error);
    throw error;
  }
};
export const getSalesData = async (): Promise<DashboardSummary> => {
  try {
    // Import these dynamically to avoid circular dependencies if they also import from here
    const { getAllOrders } = await import("./orders");
    const { getProducts } = await import("./products");

    const allOrders = await getAllOrders(1,5000);
    const departmentsResponse = await getDepartments(1, 9999);
    const allDepartments = departmentsResponse.data;
    const allClassrooms = await getClassrooms(1,999); // Fetch all classrooms

    const departmentMap = new Map(
      allDepartments.map((department) => [department.id, department.name])
    );
    const classroomToDepartmentMap = new Map(
      allClassrooms.map((classroom: Classroom) => [classroom.id, classroom.department_id])
    ); // Map classroom_id to department_id

    const allProducts = await getProducts();
    const productMap = new Map(
      allProducts.map((product) => [product.id, product.name])
    );

    let totalSalesAmount = 0;
    const rawDepartmentSales: { [key: string]: number } = {};
    const rawDepartmentCakeQuantities: { [key: string]: number } = {};
    const rawDepartmentPounds: { [key: string]: number } = {}; // New: to store total pounds per department
    const aggregatedSalesMap: { [key: string]: SalesRecord } = {};

    // Initialize rawDepartmentSales, rawDepartmentCakeQuantities, and rawDepartmentPounds with all departments and zero values
    allDepartments.forEach((department) => {
      rawDepartmentSales[department.name] = 0;
      rawDepartmentCakeQuantities[department.name] = 0;
      rawDepartmentPounds[department.name] = 0; // Initialize for new map
    });

    allOrders.forEach((order) => {
      const pickupDate = new Date(order.pickup_date);
      const saleDate = pickupDate.toISOString().split("T")[0];

      totalSalesAmount += order.totalPrice; // Keep this for total sales amount

      let effectiveDepartmentId = order.department_id;
      if (!effectiveDepartmentId && order.classroom_id) {
        effectiveDepartmentId = classroomToDepartmentMap.get(order.classroom_id as string) as
          | string
          | undefined;
      }

      if (effectiveDepartmentId) {
        const departmentName =
          departmentMap.get(effectiveDepartmentId) ||
          `Unknown Department (${effectiveDepartmentId})`;
        rawDepartmentSales[departmentName] =
          (rawDepartmentSales[departmentName] || 0) + order.totalPrice;
        let orderTotalPounds = 0; // Calculate total pounds for the current order
        order.order_items.forEach((item) => {
          rawDepartmentCakeQuantities[departmentName] =
            (rawDepartmentCakeQuantities[departmentName] || 0) + item.quantity;
          orderTotalPounds += item.pound * item.quantity; // Accumulate pounds for the order
        });
        rawDepartmentPounds[departmentName] = (rawDepartmentPounds[departmentName] || 0) + orderTotalPounds; // Add to department total pounds
      }

      order.order_items.forEach((item) => {
        const productName =
          productMap.get(item.product_id) || "Unknown Product";
        const key = `${productName}|${saleDate}`;

        if (!aggregatedSalesMap[key]) {
          aggregatedSalesMap[key] = {
            id: `${productName}-${saleDate}`, // Unique ID for the aggregated row
            productName: productName,
            qty1Pound: 0,
            qty2Pound: 0,
            qty3Pound: 0,
            qty4Pound: 0,
            qty5Pound: 0,
            totalQuantity: 0,
            totalPrice: 0,
            saleDate: saleDate,
          };
        }

        const record = aggregatedSalesMap[key];
        switch (item.pound) {
          case 1:
            record.qty1Pound += item.quantity;
            break;
          case 2:
            record.qty2Pound += item.quantity;
            break;
          case 3:
            record.qty3Pound += item.quantity;
            break;
          case 4:
            record.qty4Pound += item.quantity;
            break;
          case 5:
            record.qty5Pound += item.quantity;
            break;
        }
        record.totalQuantity += item.quantity;
        record.totalPrice += item.subtotal;
      });
    });

    const salesRecords = Object.values(aggregatedSalesMap);

    const sortedDepartments = Object.entries(rawDepartmentPounds) // Use rawDepartmentPounds here
      .map(([name, totalPounds]) => ({ name, totalPounds })) // Map to totalPounds
      .sort((a, b) => b.totalPounds - a.totalPounds); // Sort by totalPounds

    const topDepartments = sortedDepartments.slice(0, 3);

    const dailySalesMap: { [date: string]: number } = {};
    const dailyPoundsMap: { [date: string]: number } = {}; // New: to store total pounds per day

    allOrders.forEach((order) => {
      const saleDate = new Date(order.pickup_date).toISOString().split("T")[0];
      dailySalesMap[saleDate] =
        (dailySalesMap[saleDate] || 0) + order.totalPrice;

      // Calculate total pounds for the current order
      let orderTotalPounds = 0;
      order.order_items.forEach((item) => {
        orderTotalPounds += item.pound * item.quantity;
      });
      dailyPoundsMap[saleDate] = (dailyPoundsMap[saleDate] || 0) + orderTotalPounds; // Add to daily total pounds
    });

    const dailySales = Object.entries(dailySalesMap)
      .map(([date, amount]) => ({ date, amount }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const dailyPounds = Object.entries(dailyPoundsMap) // New: Process dailyPoundsMap
      .map(([date, pounds]) => ({ date, pounds }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const totalOrdersCount = allOrders.length;

    const departmentPounds = Object.entries(rawDepartmentPounds)
      .map(([name, totalPounds]) => ({
        id: allDepartments.find((department) => department.name === name)?.id || name, // Find department ID or use name as fallback
        name,
        totalPounds,
      }))
      .sort((a, b) => b.totalPounds - a.totalPounds);

    const departmentCakeQuantities = Object.entries(rawDepartmentCakeQuantities)
      .map(([name, totalQuantity]) => ({
        id: allDepartments.find((department) => department.name === name)?.id || name,
        name,
        totalQuantity,
      }))
      .sort((a, b) => b.totalQuantity - a.totalQuantity);

    return {
      totalSalesAmount,
      totalOrdersCount,
      topDepartments,
      salesRecords,
      dailySales,
      dailyPounds, // Added dailyPounds
      departmentPounds, // Changed from departmentSales
      departmentCakeQuantities,
      allProducts, // Added
    };
  } catch (error) {
    console.error("Error in getSalesData:", error);
    throw error;
  }
};
