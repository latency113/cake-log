import prisma from "@/providers/database/database.provider";

export class StudentService {
  async getTotalPoundsPerStudent() {
    const orders = await prisma.order.findMany({
      select: {
        customerName: true,
        order_items: {
          select: {
            pound: true,
          },
        },
      },
    });

    const studentPounds: { [key: string]: number } = {};

    orders.forEach(order => {
      const studentName = order.customerName;
      let totalPoundsForOrder = 0;
      order.order_items.forEach(item => {
        totalPoundsForOrder += item.pound;
      });

      if (studentPounds[studentName]) {
        studentPounds[studentName] += totalPoundsForOrder;
      } else {
        studentPounds[studentName] = totalPoundsForOrder;
      }
    });

    return studentPounds;
  }

  async getTotalPoundsPerStudentByClassroom(
    classroomId: string,
    classroomStudents: { studentId: string; studentName: string; }[] = []
  ) {
    const orders = await prisma.order.findMany({
      where: {
        classroom_id: classroomId,
      },
      select: {
        customerName: true,
        order_items: {
          select: {
            pound: true,
            quantity: true,
          },
        },
      },
    });

    const studentPoundsMap: { [key: string]: number } = {};
    let totalPoundsForClassroom = 0;

    orders.forEach(order => {
      const customerName = order.customerName.toLowerCase().trim();
      let totalPoundsForOrder = 0;
      order.order_items.forEach(item => {
        totalPoundsForOrder += item.pound * item.quantity;
      });

      totalPoundsForClassroom += totalPoundsForOrder;

      if (studentPoundsMap[customerName]) {
        studentPoundsMap[customerName] += totalPoundsForOrder;
      } else {
        studentPoundsMap[customerName] = totalPoundsForOrder;
      }
    });

    const studentsWithPounds = classroomStudents.map(student => {
      const normalizedStudentName = (student.studentName ?? '').toLowerCase().trim();
      const totalPounds = studentPoundsMap[normalizedStudentName] || 0;
      return {
        number: student.studentId,
        name: student.studentName,
        totalPounds: totalPounds
      };
    });

    return {
      students: studentsWithPounds,
      totalPoundsForClassroom,
    };
  }
}