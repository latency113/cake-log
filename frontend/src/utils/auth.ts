import { showAlertError } from "./alerts";
import type { User } from "../types";

export interface DecodedToken {
  sub?: string;
  role?: string;
  username?: string;
  iat?: number;
  exp?: number;
  [key: string]: unknown;
}

export const decodeJwtToken = (token: string): DecodedToken | null => {
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload) as DecodedToken;
  } catch (error) {
    console.error("Error decoding JWT token:", error);
    return null;
  }
};

export const checkAuthAndRole = async (
  user: User | null,
  navigate: (opts: { to: string; search?: Record<string, unknown> }) => unknown,
  allowedRoles: string[],
  redirectPath = "/login"
) => {
  if (!user) {
    showAlertError({
      title: "ไม่ได้รับอนุญาต",
      text: "คุณไม่มีสิทธิ์เข้าถึงหน้านี้",
    });
    throw navigate({ to: redirectPath, search: { unauthorized: true } });
  }

  const userRole = user.role.toLowerCase();
  const normalizedAllowed = allowedRoles.map((r) => r.toLowerCase());
  if (!normalizedAllowed.includes(userRole)) {
    showAlertError({
      title: "ไม่ได้รับอนุญาต",
      text: "คุณไม่มีสิทธิ์เข้าถึงหน้านี้",
    });
    throw navigate({ to: redirectPath, search: { unauthorized: true } });
  }
};

