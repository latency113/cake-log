import { UserService } from "@/features/services/User/User.service";
import { TeacherRepository } from "@/features/repository/Teacher/Teacher.repository";

export namespace TeacherUserService {
  // Helper function to generate a random alphanumeric string
  function generateRandomAlphanumeric(length: number = 6): string {
    const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  }

  export async function createUsersFromTeachers(defaultPassword?: string) {
    const teachers = await TeacherRepository.findAll({ skip: 0, take: 999999 }); // Fetch all teachers

    const createdUsers = [];
    const errors = [];

    for (const teacher of teachers) {
      const nameParts = teacher.name.split(" ");
      const firstname = nameParts[0] || "Default";
      const lastname = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "Teacher";

      // Generate a base random username
      let baseUsername = `${generateRandomAlphanumeric(6)}`; // e.g., teacher-abc123
      let usernameAttempt = 0;
      let userCreated = false;

      while (!userCreated) {
        let currentUsername = baseUsername;
        if (usernameAttempt > 0) {
          // If collision, append a number to the random part or the whole baseUsername
          currentUsername = `${baseUsername}-${usernameAttempt}`; 
        }

        try {
          const newUser = await UserService.create({
            firstname: firstname,
            lastname: lastname,
            username: currentUsername,
            email: `${currentUsername}@example.com`,
            password: defaultPassword || "password123",
            role: "USER",
            teacher_id: teacher.id,
          });
          createdUsers.push(newUser);
          userCreated = true;
        } catch (error: any) {
          if (error.message === "Username already exists") {
            usernameAttempt++;
            // Potentially add a safeguard to prevent infinite loops if baseUsername generation itself is flawed
            if (usernameAttempt > 100) { // arbitrary limit
                errors.push({ teacherId: teacher.id, teacherName: teacher.name, error: `Failed to generate unique username after ${usernameAttempt} attempts.` });
                userCreated = true; // give up for this teacher
            }
          } else {
            errors.push({ teacherId: teacher.id, teacherName: teacher.name, error: error.message });
            userCreated = true;
          }
        }
      }
    }

    return { createdUsers, errors };
  }
}
