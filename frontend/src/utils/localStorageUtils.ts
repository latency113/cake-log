const LAST_BOOK_NUMBER_KEY = "lastBookNumber";
const LAST_ORDER_NUMBER_KEY = "lastOrderNumber";
const LAST_DEPARTMENT_ID_KEY = "lastDepartmentId";
const LAST_YEAR_ID_KEY = "lastYearId";
const LAST_CLASSROOM_ID_KEY = "lastClassroomId";

// For fields that should be saved on change for faster input
export const saveFastInputValues = (formData: any) => {
  if (formData.department_id) {
    localStorage.setItem(LAST_DEPARTMENT_ID_KEY, formData.department_id);
  }
  if (formData.year_id) {
    localStorage.setItem(LAST_YEAR_ID_KEY, formData.year_id);
  }
  if (formData.classroom_id) {
    localStorage.setItem(LAST_CLASSROOM_ID_KEY, formData.classroom_id);
  }
};

// For fields that should only be saved after a successful form submission
export const saveBookAndOrderNumbers = (bookNumber: string, orderNumber: string) => {
  localStorage.setItem(LAST_BOOK_NUMBER_KEY, bookNumber);
  localStorage.setItem(LAST_ORDER_NUMBER_KEY, orderNumber);
};

export const loadLastUsedValues = () => {
  const lastBookNumber = localStorage.getItem(LAST_BOOK_NUMBER_KEY);
  const lastOrderNumber = localStorage.getItem(LAST_ORDER_NUMBER_KEY);
  const lastDepartmentId = localStorage.getItem(LAST_DEPARTMENT_ID_KEY);
  const lastYearId = localStorage.getItem(LAST_YEAR_ID_KEY);
  const lastClassroomId = localStorage.getItem(LAST_CLASSROOM_ID_KEY);

  return {
    book_number: lastBookNumber || "",
    number: lastOrderNumber || "", // No auto-increment here
    department_id: lastDepartmentId || "",
    year_id: lastYearId || "",
    classroom_id: lastClassroomId || "",
  };
};

// New function to get the next order number
export const getNextOrderNumber = (): string => {
  const lastOrderNumber = localStorage.getItem(LAST_ORDER_NUMBER_KEY);
  if (lastOrderNumber) {
    return (parseInt(lastOrderNumber, 10) + 1).toString();
  }
  return ""; // Or some default starting number like "1"
};