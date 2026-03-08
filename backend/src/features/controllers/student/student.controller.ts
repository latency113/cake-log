import { Elysia, t } from "elysia";
import { StudentService } from '../../services/student/student.service';
import { auth } from "@/shared/middleware/auth";

export const studentController = new Elysia().group("/student", (app) => {
  const studentService = new StudentService();

  app.use(auth)
  app.get("/total-pounds", async () => {
    try {
      const studentPounds = await studentService.getTotalPoundsPerStudent();
      return studentPounds;
    } catch (error) {
      console.error('Error getting total pounds per student:', error);
      return new Response('Internal server error', { status: 500 });
    }
  }, {
    isSignIn: true
  });

  return app;
});