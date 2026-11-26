import prisma from "@/providers/database/database.provider";
import { TeamRepository } from "@/features/repository/Team/Team.repository";

export namespace OrderSummaryService {
  export async function getClassroomCakeSummaries(filterUserId?: string) {
    const [orders, allProducts, allClassrooms] = await Promise.all([
      prisma.order.findMany({
        where: {
          classroom_id: { not: null },
          status: { not: "cancelled" },
          ...(filterUserId ? { user_id: filterUserId } : {}),
        },
        select: {
          id: true,
          classroom_id: true,
          deposit: true,
          number: true,
          book_id: true,
          book: { select: { bookNumber: true } },
          order_items: {
            select: {
              product_id: true,
              pound: true,
              quantity: true,
            },
          },
        },
        orderBy: { createdAt: "asc" },
      }),
      prisma.product.findMany({
        select: { id: true, name: true, price: true },
      }),
      prisma.classroom.findMany({
        select: {
          id: true,
          name: true,
          isOrderFinalized: true,
          department: { select: { id: true, name: true } },
          grade_level: { select: { level: true, year: true } },
          teacher: { select: { name: true } },
        },
      }),
    ]);

    const productMap = new Map(allProducts.map((p) => [p.id, p]));
    const classroomMap = new Map(allClassrooms.map((c) => [c.id, c]));

    interface InternalSummary {
      classroomId: string;
      classroomName: string;
      departmentName: string;
      gradeLevelName: string;
      advisor: string;
      roomNumber: string;
      cakeSummaries: {
        productName: string;
        totalPounds: number;
        totalQuantity: number;
        pricePerPound: number;
        totalAmount: number;
        quantityBySize: Record<number, number>;
      }[];
      depositAmount: number;
      isOrderFinalized: boolean;
      bookNumberRange?: string;
      orderNumberRange?: string;
      _bookNumbers: Set<string>;
      _orderNumbers: Set<string>;
    }

    const classroomSummaryMap = new Map<string, InternalSummary>();

    for (const order of orders) {
      if (!order.classroom_id) continue;
      const classroom = classroomMap.get(order.classroom_id);
      if (!classroom) continue;

      const departmentName = classroom.department?.name || "Unknown Department";
      const gradeLevel = classroom.grade_level;
      const gradeLevelName = gradeLevel
        ? `${
            gradeLevel.level === "VOCATIONAL"
              ? "ปวช."
              : gradeLevel.level === "HIGHER"
              ? "ปวส."
              : gradeLevel.level
          } ${gradeLevel.year}`
        : "Unknown Year";
      const advisorName = classroom.teacher?.name || "Unknown Advisor";
      const summaryKey = `${departmentName}-${gradeLevelName}-${classroom.name}`;

      if (!classroomSummaryMap.has(summaryKey)) {
        classroomSummaryMap.set(summaryKey, {
          classroomId: classroom.id,
          classroomName: classroom.name,
          departmentName,
          gradeLevelName,
          advisor: advisorName,
          roomNumber: classroom.name,
          cakeSummaries: [],
          depositAmount: 0,
          isOrderFinalized: classroom.isOrderFinalized,
          _bookNumbers: new Set<string>(),
          _orderNumbers: new Set<string>(),
        });
      }

      const current = classroomSummaryMap.get(summaryKey)!;
      current.depositAmount += order.deposit;
      if (order.book?.bookNumber) {
        current._bookNumbers.add(order.book.bookNumber);
      } else if (order.book_id) {
        current._bookNumbers.add(order.book_id);
      }
      current._orderNumbers.add(order.number);

      for (const item of order.order_items) {
        const product = productMap.get(item.product_id);
        if (!product) continue;

        let cakeSummary = current.cakeSummaries.find(
          (s) => s.productName === product.name
        );
        if (!cakeSummary) {
          cakeSummary = {
            productName: product.name,
            totalPounds: 0,
            totalQuantity: 0,
            pricePerPound: product.price,
            totalAmount: 0,
            quantityBySize: {},
          };
          current.cakeSummaries.push(cakeSummary);
        }

        cakeSummary.totalPounds += item.pound * item.quantity;
        cakeSummary.totalQuantity += item.quantity;
        cakeSummary.quantityBySize[item.pound] =
          (cakeSummary.quantityBySize[item.pound] || 0) + item.quantity;
        cakeSummary.totalAmount =
          cakeSummary.totalPounds * cakeSummary.pricePerPound;
      }
    }

    for (const summary of classroomSummaryMap.values()) {
      for (const product of allProducts) {
        if (!summary.cakeSummaries.some((c) => c.productName === product.name)) {
          summary.cakeSummaries.push({
            productName: product.name,
            totalPounds: 0,
            totalQuantity: 0,
            pricePerPound: product.price,
            totalAmount: 0,
            quantityBySize: {},
          });
        }
      }
      summary.cakeSummaries.sort((a, b) =>
        a.productName.localeCompare(b.productName)
      );
    }

    const sortedSummaries = Array.from(classroomSummaryMap.values()).sort(
      (a, b) => {
        const deptCmp = a.departmentName.localeCompare(b.departmentName);
        if (deptCmp !== 0) return deptCmp;
        const gradeCmp = a.gradeLevelName.localeCompare(b.gradeLevelName);
        if (gradeCmp !== 0) return gradeCmp;
        return a.classroomName.localeCompare(b.classroomName);
      }
    );

    return sortedSummaries.map(({ _bookNumbers, _orderNumbers, ...rest }) => {
      const bookNumbers = Array.from(_bookNumbers).sort();
      const orderNumbers = Array.from(_orderNumbers).sort();
      return {
        ...rest,
        ...(bookNumbers.length > 0
          ? {
              bookNumberRange:
                bookNumbers.length === 1
                  ? bookNumbers[0]
                  : `${bookNumbers[0]} - ${bookNumbers[bookNumbers.length - 1]}`,
            }
          : {}),
        ...(orderNumbers.length > 0
          ? {
              orderNumberRange:
                orderNumbers.length === 1
                  ? orderNumbers[0]
                  : `${orderNumbers[0]} - ${orderNumbers[orderNumbers.length - 1]}`,
            }
          : {}),
      };
    });
  }

  export async function getDashboardSummary() {
    const [
      allDepartments,
      allProducts,
      allTeams,
      orderStatsRows,
      dailyOrderRows,
      itemAggRows,
      deptAggRows,
      teamAggRows,
    ] = await Promise.all([
      prisma.department.findMany({ select: { id: true, name: true } }),
      prisma.product.findMany(),
      TeamRepository.findAll({ skip: 0, take: 9999 }),
      prisma.$queryRaw<
        {
          total_orders: number;
          cancelled_orders: number;
          completed_orders: number;
          prepared_orders: number;
          pending_orders: number;
          total_sales_amount: number;
        }[]
      >`
        SELECT
          COUNT(*)::int AS total_orders,
          COUNT(*) FILTER (WHERE status = 'cancelled')::int AS cancelled_orders,
          COUNT(*) FILTER (WHERE status != 'cancelled' AND (status = 'complete' OR picked_up_at IS NOT NULL))::int AS completed_orders,
          COUNT(*) FILTER (WHERE status != 'cancelled' AND status != 'complete' AND picked_up_at IS NULL AND officer_prepare_id IS NOT NULL)::int AS prepared_orders,
          COUNT(*) FILTER (WHERE status != 'cancelled' AND status != 'complete' AND picked_up_at IS NULL AND officer_prepare_id IS NULL)::int AS pending_orders,
          COALESCE(SUM("totalPrice") FILTER (WHERE status != 'cancelled'), 0)::float AS total_sales_amount
        FROM "Order"
      `,
      prisma.$queryRaw<
        {
          sale_date: string;
          daily_sales: number;
        }[]
      >`
        SELECT
          to_char("pickup_date" AT TIME ZONE 'UTC', 'YYYY-MM-DD') AS sale_date,
          COALESCE(SUM("totalPrice"), 0)::float AS daily_sales
        FROM "Order"
        WHERE status != 'cancelled'
        GROUP BY 1
        ORDER BY 1 ASC
      `,
      prisma.$queryRaw<
        {
          product_id: string;
          sale_date: string;
          pound: number;
          is_cancelled: boolean;
          is_completed: boolean;
          total_qty: number;
          total_pounds: number;
          total_subtotal: number;
        }[]
      >`
        SELECT
          oi.product_id,
          to_char(o."pickup_date" AT TIME ZONE 'UTC', 'YYYY-MM-DD') AS sale_date,
          oi.pound::int AS pound,
          (o.status = 'cancelled') AS is_cancelled,
          (o.status = 'complete' OR o.picked_up_at IS NOT NULL) AS is_completed,
          COALESCE(SUM(oi.quantity), 0)::int AS total_qty,
          COALESCE(SUM(oi.pound * oi.quantity), 0)::int AS total_pounds,
          COALESCE(SUM(oi.subtotal), 0)::float AS total_subtotal
        FROM "OrderItem" oi
        INNER JOIN "Order" o ON o.id = oi.order_id
        GROUP BY oi.product_id, 2, oi.pound, 4, 5
      `,
      prisma.$queryRaw<
        {
          department_id: string | null;
          total_pounds: number;
          total_quantity: number;
        }[]
      >`
        SELECT
          c.department_id,
          COALESCE(SUM(oi.pound * oi.quantity), 0)::int AS total_pounds,
          COALESCE(SUM(oi.quantity), 0)::int AS total_quantity
        FROM "Order" o
        INNER JOIN "Classroom" c ON c.id = o.classroom_id
        LEFT JOIN "OrderItem" oi ON oi.order_id = o.id
        WHERE o.status != 'cancelled'
        GROUP BY c.department_id
      `,
      prisma.$queryRaw<
        {
          team_id: string;
          total_pounds: number;
          total_baht: number;
        }[]
      >`
        SELECT
          o.team_id,
          COALESCE(SUM(oi.pound * oi.quantity), 0)::int AS total_pounds,
          COALESCE(SUM(o."totalPrice"), 0)::float AS total_baht
        FROM "Order" o
        LEFT JOIN "OrderItem" oi ON oi.order_id = o.id
        WHERE o.status != 'cancelled' AND o.team_id IS NOT NULL
        GROUP BY o.team_id
      `,
    ]);

    const orderStats = orderStatsRows[0] || {
      total_orders: 0,
      cancelled_orders: 0,
      completed_orders: 0,
      prepared_orders: 0,
      pending_orders: 0,
      total_sales_amount: 0,
    };

    const productMap = new Map(allProducts.map((p) => [p.id, p.name]));
    const departmentMap = new Map(allDepartments.map((d) => [d.id, d.name]));

    const rawProductStats: Record<
      string,
      { name: string; quantity: number; pounds: number; price: number }
    > = {};
    for (const p of allProducts) {
      rawProductStats[p.id] = { name: p.name, quantity: 0, pounds: 0, price: 0 };
    }

    const aggregatedSalesMap: Record<
      string,
      {
        id: string;
        productName: string;
        qty1Pound: number;
        qty2Pound: number;
        qty3Pound: number;
        qty4Pound: number;
        qty5Pound: number;
        totalQuantity: number;
        totalPrice: number;
        saleDate: string;
      }
    > = {};

    const dailyPoundsMap: Record<string, number> = {};
    let totalPoundsAll = 0;
    let pickedUpPounds = 0;

    for (const row of itemAggRows) {
      const productName = productMap.get(row.product_id) || "Unknown Product";
      const key = `${productName}|${row.sale_date}`;

      if (!aggregatedSalesMap[key]) {
        aggregatedSalesMap[key] = {
          id: `${productName}-${row.sale_date}`,
          productName,
          qty1Pound: 0,
          qty2Pound: 0,
          qty3Pound: 0,
          qty4Pound: 0,
          qty5Pound: 0,
          totalQuantity: 0,
          totalPrice: 0,
          saleDate: row.sale_date,
        };
      }
      const record = aggregatedSalesMap[key];
      if (row.pound === 1) record.qty1Pound += row.total_qty;
      else if (row.pound === 2) record.qty2Pound += row.total_qty;
      else if (row.pound === 3) record.qty3Pound += row.total_qty;
      else if (row.pound === 4) record.qty4Pound += row.total_qty;
      else if (row.pound === 5) record.qty5Pound += row.total_qty;
      record.totalQuantity += row.total_qty;
      record.totalPrice += row.total_subtotal;

      if (!row.is_cancelled) {
        totalPoundsAll += row.total_pounds;
        dailyPoundsMap[row.sale_date] =
          (dailyPoundsMap[row.sale_date] || 0) + row.total_pounds;

        if (row.is_completed) {
          pickedUpPounds += row.total_pounds;
        }

        if (!rawProductStats[row.product_id]) {
          rawProductStats[row.product_id] = {
            name: productMap.get(row.product_id) || "เค้ก",
            quantity: 0,
            pounds: 0,
            price: 0,
          };
        }
        rawProductStats[row.product_id].quantity += row.total_qty;
        rawProductStats[row.product_id].pounds += row.total_pounds;
        rawProductStats[row.product_id].price += row.total_subtotal;
      }
    }

    const rawDepartmentPounds: Record<string, number> = {};
    const rawDepartmentCakeQuantities: Record<string, number> = {};
    for (const d of allDepartments) {
      rawDepartmentPounds[d.name] = 0;
      rawDepartmentCakeQuantities[d.name] = 0;
    }
    for (const row of deptAggRows) {
      if (!row.department_id) continue;
      const deptName =
        departmentMap.get(row.department_id) ||
        `Unknown Department (${row.department_id})`;
      rawDepartmentPounds[deptName] =
        (rawDepartmentPounds[deptName] || 0) + row.total_pounds;
      rawDepartmentCakeQuantities[deptName] =
        (rawDepartmentCakeQuantities[deptName] || 0) + row.total_quantity;
    }

    const departmentPounds = Object.entries(rawDepartmentPounds)
      .map(([name, totalPounds]) => ({
        id: allDepartments.find((d) => d.name === name)?.id || name,
        name,
        totalPounds,
      }))
      .sort((a, b) => b.totalPounds - a.totalPounds);

    const departmentCakeQuantities = Object.entries(rawDepartmentCakeQuantities)
      .map(([name, totalQuantity]) => ({
        id: allDepartments.find((d) => d.name === name)?.id || name,
        name,
        totalQuantity,
      }))
      .sort((a, b) => b.totalQuantity - a.totalQuantity);

    const topDepartments = departmentPounds
      .map(({ name, totalPounds }) => ({ name, totalPounds }))
      .slice(0, 5);

    const teamOrderSales = new Map(
      teamAggRows.map((r) => [
        r.team_id,
        { pounds: r.total_pounds, baht: r.total_baht },
      ])
    );

    const topTeams = allTeams
      .map((t) => {
        const orderStatsForTeam = teamOrderSales.get(t.id);
        const pounds = Math.max(
          t.total_sales_pounds || 0,
          orderStatsForTeam?.pounds || 0
        );
        const baht = Math.max(
          t.total_sales_baht || 0,
          orderStatsForTeam?.baht || 0
        );
        const deptName = t.departments?.[0]?.name;
        return {
          id: t.id,
          name: t.name,
          team_type: t.team_type as "team" | "person",
          total_sales_pounds: pounds,
          total_sales_baht: baht,
          student_member_name: t.student_member_name,
          departmentName: deptName,
        };
      })
      .sort((a, b) => b.total_sales_pounds - a.total_sales_pounds);

    const productBreakdown = Object.entries(rawProductStats)
      .map(([id, stats]) => ({
        id,
        name: stats.name,
        totalQuantity: stats.quantity,
        totalPounds: stats.pounds,
        totalPrice: stats.price,
        percentage:
          totalPoundsAll > 0
            ? Math.round((stats.pounds / totalPoundsAll) * 100)
            : 0,
      }))
      .sort((a, b) => b.totalPounds - a.totalPounds);

    const activeOrders = orderStats.total_orders - orderStats.cancelled_orders;
    const fulfillmentRate =
      activeOrders > 0
        ? Math.round((orderStats.completed_orders / activeOrders) * 100)
        : 0;

    const dailySales = dailyOrderRows.map((r) => ({
      date: r.sale_date,
      amount: r.daily_sales,
    }));

    const dailyPounds = Object.entries(dailyPoundsMap)
      .map(([date, pounds]) => ({ date, pounds }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return {
      totalSalesAmount: orderStats.total_sales_amount,
      totalOrdersCount: orderStats.total_orders,
      topDepartments,
      topTeams,
      productBreakdown,
      fulfillmentStats: {
        totalOrders: orderStats.total_orders,
        completedOrders: orderStats.completed_orders,
        preparedOrders: orderStats.prepared_orders,
        pendingOrders: orderStats.pending_orders,
        cancelledOrders: orderStats.cancelled_orders,
        fulfillmentRate,
        totalPounds: totalPoundsAll,
        pickedUpPounds,
        remainingPounds: Math.max(0, totalPoundsAll - pickedUpPounds),
      },
      salesRecords: Object.values(aggregatedSalesMap),
      dailySales,
      dailyPounds,
      departmentPounds,
      departmentCakeQuantities,
      allProducts,
    };
  }
}
