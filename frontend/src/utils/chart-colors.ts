// src/utils/chart-colors.ts

export const DEPARTMENT_COLOR_MAP: { [key: string]: string } = {
  "แผนกทั่วไป": "#4F46E5",
  "แผนกช่างยนต์": "#10B981",
  "แผนกบัญชี": "#F59E0B",
  "แผนกคอมพิวเตอร์": "#EF4444",
  "แผนกไฟฟ้า": "#3B82F6",
  "แผนกอิเล็กทรอนิกส์": "#8B5CF6",
  "แผนกการตลาด": "#D946EF",
  "แผนกคหกรรม": "#EC4899",
  "แผนกภาษาต่างประเทศ": "#6366F1",
  "แผนกศิลปกรรม": "#F97316",
  "แผนกวิทยาศาสตร์": "#14B8A6",
  "แผนกสังคมศึกษา": "#65A30D",
  // Add more departments and their specific colors as needed
};

// Fallback colors to use if a department is not explicitly defined in DEPARTMENT_COLOR_MAP
const FALLBACK_COLORS = [
    "#4F46E5", // Indigo
    "#10B981", // Emerald
    "#F59E0B", // Amber
    "#EF4444", // Red
    "#3B82F6", // Blue
    "#8B5CF6", // Violet
    "#D946EF", // Fuchsia
    "#EC4899", // Pink
    "#6366F1", // Indigo-light
    "#F97316", // Orange
    "#14B8A6", // Teal
    "#65A30D", // Lime
];

let fallbackColorIndex = 0;
export const getDepartmentColor = (departmentName: string): string => {
  if (DEPARTMENT_COLOR_MAP[departmentName]) {
    return DEPARTMENT_COLOR_MAP[departmentName];
  }
  // Assign a fallback color if not explicitly defined
  const color = FALLBACK_COLORS[fallbackColorIndex % FALLBACK_COLORS.length];
  fallbackColorIndex++; // Move to the next color for the next unknown department
  DEPARTMENT_COLOR_MAP[departmentName] = color; // Store for consistency during current session
  return color;
};