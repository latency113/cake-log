import { Elysia } from "elysia";

import { UserController } from "./User/User.controller";
import { DepartmentController } from "./Department/Department.controller";
import { TeacherController } from "./Teacher/Teacher.controller";
import { GradeLevelController } from "./GradeLevel/GradeLevel.controller";
import { ClassroomController } from "./Classroom/Classroom.controller";
import { TeamController } from "./Team/Team.controller";
import { ProductController } from "./Product/Product.controller";
import { OrderController } from "./Order/Order.controller";
import { OrderItemController } from "./OrderItem/OrderItem.controller";
import { OrderBookController } from "./OrderBook/OrderBook.controller";
import { AuthController } from "./auth/auth.controllers";
import { TokenController } from "./Token/Token.controller";
import { studentController } from "./student/student.controller";
import { adminController } from "./admin/admin.controller"; // Import the new admin controller
import { auth } from "../../shared/middleware/auth";

export const app = new Elysia().group("/api/v1", (app) => {
  app.use(auth);
  app.use(AuthController.authController);

  return app.guard(
    {
      beforeHandle: ({ user, set }) => {
        if (!user) {
          set.status = 401;
          return { message: "Unauthorized" };
        }
      },
      detail: {
        security: [{ bearerAuth: [] }],
      },
    },
    (protectedApp) =>
      protectedApp
        .use(TokenController.tokenController)
        .use(UserController.userController)
        .use(studentController)
        .use(DepartmentController.departmentController)
        .use(TeacherController.teacherController)
        .use(GradeLevelController.gradeLevelController)
        .use(ClassroomController.classroomController)
        .use(TeamController.teamController)
        .use(ProductController.productController)
        .use(OrderController.orderController)
        .use(OrderItemController.orderItemController)
        .use(OrderBookController.orderBookController)
        .group("/admin", (adminApp) => {
          adminApp.use(adminController);
          return adminApp;
        })
  );
});
