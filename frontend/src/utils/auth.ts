export const decodeJwtToken = (token: string) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Error decoding JWT token:", error);
    return null;
  }
};

import { showAlertError } from "./alerts";
import type { User } from "../types";

export const checkAuthAndRole = async (
  user: User | null,
  navigate: any, // Replace 'any' with the actual navigate type from @tanstack/react-router if possible
  allowedRoles: string[],
  redirectPath: string = "/login"
) => {
  if (!user) {
    console.log("User not authenticated, showing alert.");
    showAlertError({
      title: "ไม่ได้รับอนุญาต",
      text: "คุณไม่มีสิทธิ์เข้าถึงหน้านี้",
    });
    throw navigate({ to: redirectPath, search: { unauthorized: true } });
  }

  const userRole = user.role.toLowerCase();
  if (!allowedRoles.includes(userRole)) {
    console.log(`User role '${userRole}' not in allowed roles: ${allowedRoles.join(", ")}. Showing alert.`);
    showAlertError({
      title: "ไม่ได้รับอนุญาต",
      text: "คุณไม่มีสิทธิ์เข้าถึงหน้านี้",
    });
    throw navigate({ to: redirectPath, search: { unauthorized: true } });
  }
};
