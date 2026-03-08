// src/utils/formValidation.ts
import { showToastError } from "./alerts";

export const validateBookNumber = (value: string | number): boolean => {
  if (!value) return false;
  const strValue = String(value);
  if (strValue.trim() === '') return false;
  return true;
};

export const validateOrderNumber = (value: string | number): boolean => {
  if (typeof value === 'string' && value.trim() === '') {
    return true; // Allow empty string for clearing the field
  }
  if (typeof value !== 'string' || !/^[0-9]+$/.test(value)) {
    // Optionally show an error if it's not a valid number string
    // showToastError({ text: "เลขที่ต้องเป็นตัวเลขเท่านั้น" });
    return false;
  }
  return true;
};

export const validateCustomerName = (value: string): boolean => {
  if (!/^[a-zA-Zก-๏\s-]+$/.test(value)) {
    showToastError({ text: "ชื่อผู้แข่งขัน/ชื่อ - นามสกุล ต้องเป็นตัวอักษรเท่านั้น" });
    return false;
  }
  return true;
};

export const validateAdvisorName = (value: string): boolean => {
  const cleanedValue = value.trim().replace(/\u200B/g, ''); // Remove zero-width space character
  if (!/^[a-zA-Zก-๏\s]*$/.test(cleanedValue)) {
    showToastError({ text: "ครูที่ปรึกษา ต้องเป็นตัวอักษรเท่านั้น" });
    return false;
  }
  return true;
};

export const validatePhoneNumber = (value: string): boolean => {
  const numericValue = value.replace(/[^0-9]/g, "");
  if (numericValue.length > 0 && numericValue.length !== 10) {
    showToastError({ text: "เบอร์โทรศัพท์ต้องมี 10 หลัก" });
    return false;
  }
  return true;
};

export const validateCakeQuantity = (totalCakePounds: number): boolean => {
  if (totalCakePounds === 0) {
    showToastError({ text: "กรุณาเพิ่มจำนวนเค้กอย่างน้อย 1 ชิ้น" });
    return false;
  }
  return true;
};