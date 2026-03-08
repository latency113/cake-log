export interface ClassroomCakeSummary {
  classroomId: string; // Added classroom ID for filtering
  classroomName: string;
  departmentName: string; // Added department name
  gradeLevelName: string; // Added grade level name (e.g., "ปวช. 1", "ปวส. 2")
  advisor: string; // Added advisor name
  roomNumber: string; // Added room number
  cakeSummaries: {
    productName: string;
    totalPounds: number;
    totalQuantity: number;
    pricePerPound: number; // Added price per pound
    totalAmount: number; // Added total amount for this cake type
    quantityBySize: Record<number, number>;
  }[];
  depositAmount?: number; // Initialize deposit amount
  bookNumberRange?: string; // New: Store aggregated book number range
  orderNumberRange?: string; // New: Store aggregated order number range
  isOrderFinalized?: boolean; // Added
  _bookNumbers: Set<string>; // Internal temporary storage for book numbers
  _orderNumbers: Set<string>; // Internal temporary storage for order numbers
}
