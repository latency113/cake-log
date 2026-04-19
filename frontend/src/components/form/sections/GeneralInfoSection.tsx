import React, { useState, useEffect } from "react";
import InputField from "../../common/InputField";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import RadioGroup from "../../common/RadioGroup";
import type {
  OrderFormState,
  InputChangeEvent,
  Year,
  Team,
  Classroom,
  Department,
  FormErrors,
  OrderBook,
} from "../../../types";
import { getTeachers } from "../../../utils/api/teachers";
import { getClassrooms } from "../../../utils/api/classrooms";

import {
  validateOrderNumber,
  validateCustomerName,
  validateAdvisorName,
  validatePhoneNumber,
} from "../../../utils/formValidation";
import {
  User,
  Users,
  Phone,
  GraduationCap,
  Building,
  Calendar,
  House,
  UserCheck,
  BookUser,
  Book,
} from "lucide-react";
import useGeneralInfoData from "../../../hooks/useGeneralInfoData";
import { useAuth } from "@/contexts/AuthContext";

interface GeneralInfoSectionProps {
  formData: OrderFormState;
  handleChange: (e: InputChangeEvent) => void;
  departments: Department[];
  years: Year[];
  teams?: Team[];
  orderBooks: OrderBook[];
  errors: FormErrors;
  numberError: string | null;
  isCheckingNumber: boolean;
  handleNumberBlur: (value: string) => Promise<void>;
  isBookLocked?: boolean;
  isTeacherInfoLocked?: boolean;
}

const orderTypeOptions = [
  { value: "team", label: "แข่งขัน ทีม" },
  { value: "person", label: "แข่งขัน บุคคล" },
  { value: "noteam", label: "ไม่แข่งขัน" },
];

const timeSlotOptions = [
  { value: "morning", label: "เช้า ( 08:00 น. - 12:00 น.)" },
  { value: "afternoon", label: "บ่าย ( 13:00 น. - 18:00 น.)" },
];

const GeneralInfoSection: React.FC<GeneralInfoSectionProps> = ({
  formData,
  handleChange,
  departments,
  years,
  teams,
  orderBooks,
  numberError,
  isCheckingNumber,
  handleNumberBlur,
  isBookLocked = false,
  isTeacherInfoLocked = false,
}) => {
  const { user } = useAuth();
  const {
    departmentOptions,
    classroomOptions,
    classLevelOptions,
    teamOptions,
  } = useGeneralInfoData({ formData, departments, years, teams, user }); // Pass user to hook

  // Determine if selection should be fully locked (e.g. only 1 room assigned)
  // or just restricted (multiple rooms assigned, but only their own).
  // The useGeneralInfoData hook already filters the options.
  // We only force-disable the Select components if the teacher has exactly 1 room.
  const isTeacher = user?.role === "USER" || !!user?.teacher_id;
  const myClassroomCount = user?.teacher?.classroom?.length || 0;
  
  // Only fully lock if editing or if teacher has only one classroom globally
  const isFullyLocked = isTeacherInfoLocked || (isTeacher && myClassroomCount === 1);
  
  // Auto-lock fields if a book is selected, since the book is tied to a specific room.
  // Also lock if the teacher is fully restricted to 1 room.
  const isDepartmentLocked = isFullyLocked || !!formData.book_id || (isTeacher && departmentOptions.length <= 1);
  const isYearLocked = isFullyLocked || !!formData.book_id; 
  const isClassroomLocked = isFullyLocked || !!formData.book_id;

  // Auto-select if only one option exists (prevents "locked but empty" state)
  useEffect(() => {
    if (isTeacher && departmentOptions.length === 1) {
      if (formData.department_id !== departmentOptions[0].value) {
        handleChange({ target: { name: "department_id", value: departmentOptions[0].value } } as InputChangeEvent);
      }
    }
  }, [departmentOptions, formData.department_id, isTeacher, handleChange]);

  useEffect(() => {
    if (isTeacher && classLevelOptions.length === 1) {
      if (formData.year_id !== classLevelOptions[0].value) {
        handleChange({ target: { name: "year_id", value: classLevelOptions[0].value } } as InputChangeEvent);
      }
    }
  }, [classLevelOptions, formData.year_id, isTeacher, handleChange]);

  useEffect(() => {
    if (isTeacher && classroomOptions.length === 1) {
      if (formData.classroom_id !== classroomOptions[0].value) {
        handleChange({ target: { name: "classroom_id", value: classroomOptions[0].value } } as InputChangeEvent);
      }
    }
  }, [classroomOptions, formData.classroom_id, isTeacher, handleChange]);

  // Debug logs to identify issues with teacher detection or option filtering
  useEffect(() => {
    if (isTeacher) {
      // console.log("Teacher detected:", user?.username);
      // console.log("My Classrooms count:", myClassroomCount);
      // console.log("Available Department options:", departmentOptions.length);
      
      // Safety check: If user is teacher, but selected department is NOT in valid options, clear it or set to first valid
      if (formData.department_id && departmentOptions.length > 0) {
         const isValid = departmentOptions.some(opt => opt.value === formData.department_id);
         if (!isValid) {
             console.warn("Invalid department selected for teacher, auto-correcting...");
             handleChange({
                 target: { name: "department_id", value: departmentOptions[0].value }
             } as InputChangeEvent);
         }
      }
    }
  }, [isTeacher, user, myClassroomCount, departmentOptions, formData.department_id, handleChange]);

  const [classroomsMap, setClassroomsMap] = useState<Map<string, Classroom>>(
    new Map()
  );
  const [teachersMap, setTeachersMap] = useState<Map<string, string>>(
    new Map()
  );
  const [studentOptions, setStudentOptions] = useState<
    { value: string; label: string }[]
  >([]);
  const [customerNameSearchTerm, setCustomerNameSearchTerm] = useState(
    formData.customerName || ""
  );
  const [openCustomerNameSelect, setOpenCustomerNameSelect] = useState(false);

  // Generate date options
const currentYearAD = new Date().getFullYear();

  // Initializer for selectedDay
  const getInitialDay = (pickupDate: string | undefined): string => {
    if (pickupDate) {
      const date = new Date(pickupDate);
      if (!isNaN(date.getTime())) {
        return Math.min(date.getDate(), 31).toString();
      }
    }
    return ""; // Default to empty if no valid pickup_date
  };

  // Initializer for selectedMonth
  const getInitialMonth = (): string => {
    return "12"; // Always default to December
  };

  // Initializer for selectedYear
  const getInitialYear = (): string => {
    return currentYearAD.toString(); // Always default to current year
  };

  // Date selection states
  const [selectedDay, setSelectedDay] = useState<string>(
    getInitialDay(formData.pickup_date)
  );
  const [selectedMonth, setSelectedMonth] = useState<string>(
    getInitialMonth()
  );
  const [selectedYear, setSelectedYear] = useState<string>(
    getInitialYear()
  );

  // Dynamic month options
  const monthOptions = Array.from({ length: 12 }, (_, i) => {
    const monthIndex = i + 1;
    const date = new Date(currentYearAD, monthIndex - 1); // Use currentYearAD to create a date for label
    const label = date.toLocaleString("th-TH", { month: "long" });
    return { value: monthIndex.toString(), label };
  });

  // Dynamic year options
  const getDynamicYearOptions = (currentSelectedYear: string) => {
    const startYear = Math.min(currentYearAD - 5, parseInt(currentSelectedYear) - 2);
    const endYear = Math.max(currentYearAD + 5, parseInt(currentSelectedYear) + 2);
    const years = [];
    for (let year = startYear; year <= endYear; year++) {
      years.push({ value: year.toString(), label: (year + 543).toString() });
    }
    return years;
  };
  const yearDisplayOptions = getDynamicYearOptions(selectedYear);

  // Effect to sync formData.pickup_date based on selectedDay, selectedMonth, selectedYear, and time_type
  useEffect(() => {
    if (selectedDay && selectedMonth && selectedYear) {
      const selectedHourUTC = formData.time_type === "morning" ? 9 : 13;
      const newDatePart = `${selectedYear}-${selectedMonth.padStart(
        2,
        "0"
      )}-${selectedDay.padStart(2, "0")}`;
      const combinedDateTime = `${newDatePart}T${selectedHourUTC
        .toString()
        .padStart(2, "0")}:00:00.000Z`;

      // Only update if different to prevent infinite loops
      if (formData.pickup_date !== combinedDateTime) {
        handleChange({
          target: {
            name: "pickup_date",
            value: combinedDateTime,
          },
        } as InputChangeEvent);
      }
    } else if (formData.pickup_date !== "") {
      // If any date component is missing, and formData.pickup_date is not empty, clear formData.pickup_date
      handleChange({
        target: {
          name: "pickup_date",
          value: "",
        },
      } as InputChangeEvent);
    }
  }, [
    selectedDay,
    selectedMonth,
    selectedYear,
    formData.time_type,
    formData.pickup_date,
  ]);

  const handleDayChange = (e: InputChangeEvent) => {
    // 1. ✅ แก้ไข: logic สำหรับ InputField ที่กรอกค่าเอง
    const value = e.target.value.replace(/[^0-9]/g, ""); // อนุญาตเฉพาะตัวเลข
    const day = parseInt(value, 10);

    if (value === "") {
      // Allow empty input for partial entry (clearing input)
      setSelectedDay("");
    } else if (!isNaN(day) && day >= 1 && day <= 31) {
      // Allow valid input
      setSelectedDay(value);
    }
    // ถ้ากรอกค่าที่ไม่ถูกต้อง (เช่น > 31 หรือตัวอักษร) จะไม่ทำอะไร (ไม่ update state)
  };

  const handleMonthChange = (value: string) => {
    setSelectedMonth(value);
  };

  const handleYearChange = (value: string) => {
    setSelectedYear(value);
  };

  // ✅ บันทึกค่าปัจจุบันลง localStorage ทุกครั้งที่เปลี่ยน
  useEffect(() => {
    const selections = {
      department_id: formData.department_id,
      year_id: formData.year_id,
      classroom_id: formData.classroom_id,
      number: formData.number,
      book_id: formData.book_id,
    };
    localStorage.setItem("orderFormSelections", JSON.stringify(selections));
  }, [
    formData.department_id,
    formData.year_id,
    formData.classroom_id,
    formData.number,
    formData.book_id,
  ]);

  // ✅ โหลดข้อมูลห้องเรียน / ครู
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const [classroomsData, teachersData] = await Promise.all([
          getClassrooms(1, 999),
          getTeachers(),
        ]);

        const newClassroomsMap = new Map<string, Classroom>();
        classroomsData.data.forEach((classroom) =>
          newClassroomsMap.set(classroom.id, classroom)
        );
        setClassroomsMap(newClassroomsMap);

        const newTeachersMap = new Map<string, string>();
        teachersData.forEach((teacher) =>
          newTeachersMap.set(teacher.id, teacher.name)
        );
        setTeachersMap(newTeachersMap);
      } catch (error) {
        console.error("Error fetching all data for GeneralInfoSection:", error);
      }
    };
    fetchAllData();
  }, []);

  useEffect(() => {
    const updateAdvisorAndStudents = () => {
      let newAdvisorValue = "";
      let newStudentOptions: { value: string; label: string }[] = [];

      if (formData.classroom_id) {
        const selectedClassroom = classroomsMap.get(formData.classroom_id);
        if (selectedClassroom) {
          const advisorName = teachersMap.get(selectedClassroom.teacher_id);
          if (advisorName) {
            newAdvisorValue = advisorName;
          }
          if (
            selectedClassroom.students &&
            selectedClassroom.students.length > 0
          ) {
            newStudentOptions = selectedClassroom.students.map((student) => ({
              value: student.studentName,
              label: student.studentName,
            }));
          }
        }
      }

      if (formData.advisor !== newAdvisorValue) {
        handleChange({
          target: {
            name: "advisor",
            value: newAdvisorValue,
          },
        } as InputChangeEvent);
      }

      setStudentOptions(newStudentOptions);

      // If classroom changes and formData.customerName is not part of the new student options,
      // and it was not set from initial order, then clear it.
      // This logic is complex and might need re-evaluation. For now, let's simplify.
      // If a customerName was provided by initialOrder, we should keep it.
      // If the classroom_id changes, and the existing customerName is not in the new list,
      // it means the old customerName is irrelevant.
      // For editing, if customerName comes from initialOrder, we keep it.
      // For new orders, if customerName was manually entered or selected and then classroom changes,
      // it might need to be cleared.

      // Let's rely on the Select's value prop to handle displaying customerName.
      // The validation should flag if the customerName is not valid for the selected classroom.
    };

    updateAdvisorAndStudents();
  }, [
    formData.classroom_id,
    formData.advisor,
    formData.customerName, // Keep this to react to changes in formData.customerName
    classroomsMap,
    teachersMap,
    handleChange,
  ]);

  // Effect to synchronize customerNameSearchTerm with formData.customerName
  useEffect(() => {
    if (customerNameSearchTerm !== formData.customerName) {
      setCustomerNameSearchTerm(formData.customerName || "");
    }
  }, [formData.customerName]);

  const handleDepartmentSelectChange = (value: string) => {
    handleChange({
      target: {
        name: "department_id",
        value,
      },
    } as InputChangeEvent);
  };

  const handleYearSelectChange = (value: string) => {
    handleChange({
      target: {
        name: "year_id",
        value,
      },
    } as InputChangeEvent);
  };

  const handleClassroomSelectChange = (value: string) => {
    handleChange({
      target: {
        name: "classroom_id",
        value,
      },
    } as InputChangeEvent);
  };

  const handleTeamSelectChange = (value: string) => {
    handleChange({
      target: {
        name: "team_id",
        value,
      },
    } as InputChangeEvent);
  };

  const handlePickupTimeSlotSelectChange = (value: string) => {
    // The previous logic to construct combinedDateTime and update pickup_date is removed.
    // The new useEffect will handle updating pickup_date when time_type changes.
    handleChange({
      target: { name: "time_type", value },
    } as InputChangeEvent);
  };

  const handleLocalChange = (e: InputChangeEvent) => {
    const { name, value } = e.target;
    let newValue: string | number = value;
    let shouldUpdate = true;

    switch (name) {
      case "phone":
        // อนุญาตให้กรอกเฉพาะตัวเลขเท่านั้น
        newValue = value.replace(/[^0-9]/g, "");
        break;
      case "number":
        newValue = value.replace(/[^0-9]/g, "");
        if (!validateOrderNumber(newValue)) shouldUpdate = false;

        // ✅ Restrict range based on selected book
        const currentBook = orderBooks.find((b) => b.id === formData.book_id);
        if (currentBook && newValue !== "") {
          const num = parseInt(newValue, 10);
          const end = parseInt(currentBook.endNumber, 10);
          // Only prevent typing if the new value *already* exceeds the end number's digit count or value
          // or if it's clearly out of range once the user finishes. 
          // For typing experience, we mostly check the upper bound value.
          if (num > end) shouldUpdate = false;
        }
        break;
      case "customerName": // This case is for when customerName is handled by another input, not the searchable one
        // This case should ideally not be hit for the search input
        newValue = value; // Keep for backward compatibility or other inputs
        break;
      case "customerNameSearch": // New case for the searchable input
        setCustomerNameSearchTerm(value);
        shouldUpdate = false; // Prevent default handleChange
        break;
      case "advisor":
        if (!validateAdvisorName(value as string)) shouldUpdate = false;
        newValue = value;
        break;
    }

    if (shouldUpdate) {
      handleChange({ ...e, target: { ...e.target, name, value: newValue } });
    }
  };

  const filteredStudentOptions = studentOptions.filter((option) =>
    option.label.toLowerCase().includes(customerNameSearchTerm.toLowerCase())
  );

  const handleCustomerNameSelectChange = (value: string) => {
    handleChange({
      target: { name: "customerName", value: value },
    } as InputChangeEvent);
    setCustomerNameSearchTerm(value);
    setOpenCustomerNameSelect(false);
  };

  const validateFieldOnBlur = (name: string, value: string | number) => {
    switch (name) {
      case "customerName":
        validateCustomerName(value as string);
        break;
      case "advisor":
        validateAdvisorName(value as string);
        break;
    }
  };

  const handlePhoneBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    validatePhoneNumber(e.target.value);
  };

  const handleOrderBookSelectChange = (value: string) => {
    handleChange({
      target: { name: "book_id", value: value },
    } as InputChangeEvent);
  };

  const currentBook = orderBooks.find((b) => b.id === formData.book_id);

  return (
    <div className="bg-card rounded-sm shadow-sm border border-border p-6 w-2/4">
      <div className="flex items-center space-x-3 mb-4 pb-3 border-b border-border">
        <div className="p-2 bg-blue-50 rounded-xl">
          <User className="w-4 h-4 text-blue-600" />
        </div>
        <h3 className="text-lg font-semibold text-foreground">
          ข้อมูลผู้สั่งซื้อ
        </h3>
      </div>

      <div className="space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-end lg:space-x-6 space-y-4 lg:space-y-0">
          <div className="flex-1">
            {/* Reverted to RadioGroup */}
            <RadioGroup
              label="ประเภทการสั่งซื้อ"
              name="competitionType"
              selectedValue={formData.competitionType}
              options={orderTypeOptions}
              onChange={handleChange} // RadioGroup uses original handleChange
              className="mb-0"
            />
          </div>

          <div className="flex space-x-4">
            <div className="relative">
              <label className="block text-sm font-medium text-foreground mb-2">
                <div className="flex items-center space-x-2">
                  <Book className="w-3.5 h-3.5 text-muted-foreground" />
                  <span>เล่มที่</span>
                </div>
              </label>
              <Select
                onValueChange={handleOrderBookSelectChange}
                value={formData.book_id || ""}
                disabled={isBookLocked}
              >
                <SelectTrigger className="w-36 h-9 px-2 border-2 border-border rounded-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all bg-card disabled:bg-muted disabled:text-muted-foreground">
                  <SelectValue placeholder="เลือกเล่มที่" />
                </SelectTrigger>
                <SelectContent>
                  {orderBooks.map((book) => {
                    const isCurrentBook = book.id === formData.book_id;
                    const isFull = book.currentNumber >= book.maxCapacity;
                    const isDisabled = book.isClosed || (isFull && !isCurrentBook);
                    
                    return (
                      <SelectItem 
                        key={book.id} 
                        value={book.id} 
                        disabled={isDisabled}
                      >
                        {book.bookNumber} ({book.startNumber}-{book.endNumber}) {book.isClosed ? '(ปิด)' : isFull ? '(เต็ม)' : ''}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <div className="relative">
              <label className="block text-sm font-medium text-foreground mb-2">
                <div className="flex items-center space-x-2">
                  <BookUser className="w-3.5 h-3.5 text-muted-foreground" />
                  <span>เลขที่</span>
                </div>
              </label>
              <InputField
                label=""
                name="number"
                value={formData.number}
                onChange={handleLocalChange}
                onBlur={(e) => handleNumberBlur(e.target.value)}
                className="mb-0"
                inputClassName={`w-28 h-9 px-2 border-2 border-border rounded-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all ${
                  numberError ? "border-red-500" : ""
                }`}
                labelClassName="hidden"
                required={true}
                maxlength={4}
                disabled={
                  isCheckingNumber || 
                  !formData.book_id || 
                  (currentBook && currentBook.currentNumber >= currentBook.maxCapacity && formData.id === undefined)
                }
                errorMessage={numberError || undefined}
              />
              {currentBook && (
                <div className="absolute left-0 -bottom-5 text-[10px] text-muted-foreground whitespace-nowrap">
                  เลขที่: {currentBook.startNumber} - {currentBook.endNumber}
                </div>
              )}
              {isCheckingNumber && (
                <div className="absolute right-2 top-9 text-xs text-muted-foreground">
                  ...
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative">
            <label className="block text-sm font-medium text-foreground mb-2">
              <div className="flex items-center space-x-2">
                <Building className="w-3.5 h-3.5 text-muted-foreground" />
                <span>แผนก</span>
              </div>
            </label>
            <Select
              onValueChange={handleDepartmentSelectChange}
              value={formData.department_id || ""}
              disabled={isDepartmentLocked}
            >
              <SelectTrigger className="w-full h-9 px-2 border-2 border-border rounded-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all bg-card disabled:bg-muted disabled:text-muted-foreground">
                <SelectValue placeholder="เลือกแผนก" />
              </SelectTrigger>
              <SelectContent>
                {departmentOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="relative">
            <label className="block text-sm font-medium text-foreground mb-2">
              <div className="flex items-center space-x-2">
                <GraduationCap className="w-3.5 h-3.5 text-muted-foreground" />
                <span>ระดับชั้น</span>
              </div>
            </label>
            <Select
              onValueChange={handleYearSelectChange}
              value={formData.year_id || ""}
              disabled={!formData.department_id || isYearLocked}
            >
              <SelectTrigger className="w-full h-9 px-2 border-2 border-border rounded-sm bg-card disabled:bg-muted disabled:text-muted-foreground">
                <SelectValue placeholder="เลือกระดับชั้น" />
              </SelectTrigger>
              <SelectContent>
                {classLevelOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="relative">
            <label className="block text-sm font-medium text-foreground mb-2">
              <div className="flex items-center space-x-2">
                <House className="w-3.5 h-3.5 text-muted-foreground" />
                <span>ห้อง</span>
              </div>
            </label>
            <Select
              onValueChange={handleClassroomSelectChange}
              value={formData.classroom_id || ""}
              disabled={!formData.year_id || isClassroomLocked}
            >
              <SelectTrigger className="w-full h-9 px-2 border-2 border-border rounded-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all bg-card disabled:bg-muted disabled:text-muted-foreground">
                <SelectValue placeholder="เลือกห้องเรียน" />
              </SelectTrigger>
              <SelectContent>
                {classroomOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="relative">
            <label className="block text-sm font-medium text-foreground mb-2">
              <div className="flex items-center space-x-2">
                <Users className="w-3.5 h-3.5 text-muted-foreground" />
                <span>
                  {formData.competitionType === "team"
                    ? "ทีม"
                    : formData.competitionType === "person"
                    ? "แข่งขันบุคคล"
                    : "ไม่แข่งขัน"}
                </span>
              </div>
            </label>
            <Select
              onValueChange={handleTeamSelectChange}
              value={formData.team_id || ""}
              disabled={
                formData.competitionType === "noteam"
              }
            >
              <SelectTrigger className="w-full h-9 px-2 border-2 border-border rounded-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all bg-card disabled:bg-muted disabled:text-muted-foreground">
                <SelectValue
                  placeholder={
                    formData.competitionType === "team"
                      ? "เลือกทีม"
                      : formData.competitionType === "person"
                      ? "เลือกบุคคล"
                      : "ไม่สามารถเลือกทีมได้ (ไม่แข่งขัน)"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {teamOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="relative">
            <label className="block text-sm font-medium text-foreground mb-2">
              <div className="flex items-center space-x-2">
                {formData.competitionType === "noteam" ? (
                  <UserCheck className="w-3.5 h-3.5 text-muted-foreground" />
                ) : (
                  <User className="w-3.5 h-3.5 text-muted-foreground" />
                )}
                <span>ชื่อ - นามสกุล</span>
              </div>
            </label>
            <Select
              onValueChange={handleCustomerNameSelectChange}
              value={formData.customerName}
              open={openCustomerNameSelect}
              onOpenChange={setOpenCustomerNameSelect}
              disabled={!formData.classroom_id || studentOptions.length === 0}
            >
              <SelectTrigger
                id="customerName"
                className="w-full h-10 px-3 border-2 border-border rounded-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all bg-card disabled:bg-muted disabled:text-muted-foreground"
              >
                <SelectValue placeholder="เลือกชื่อนักเรียน">
                  {formData.customerName || (
                    <span className="text-muted-foreground">
                      {!formData.classroom_id
                        ? "กรุณาเลือกห้องเรียนก่อน"
                        : "เลือกชื่อนักเรียน"}
                    </span>
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="p-0 w-[--radix-select-trigger-width]">
                <div className="sticky top-0 z-10 bg-background border-b border-border p-2">
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                    <InputField
                      label=""
                      name="customerNameSearch"
                      value={customerNameSearchTerm}
                      onChange={(e) => {
                        handleLocalChange(e);
                        e.stopPropagation();
                      }}
                      type="text"
                      placeholder="ค้นหาชื่อนักเรียน..."
                      className="mb-0"
                      inputClassName="w-full h-10 pl-10 pr-3 border-2 border-border rounded-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all bg-background"
                      labelClassName="sr-only"
                    />
                  </div>
                  {customerNameSearchTerm && (
                    <div className="mt-2 text-xs text-muted-foreground px-1">
                      พบ {filteredStudentOptions.length} รายการ
                    </div>
                  )}
                </div>
                <div className="max-h-[300px] overflow-y-auto">
                  {filteredStudentOptions.length === 0 ? (
                    <div className="py-8 text-center">
                      <User className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                      <p className="text-sm text-muted-foreground font-medium">
                        {!formData.classroom_id
                          ? "กรุณาเลือกห้องเรียนก่อน"
                          : "ไม่พบนักเรียนที่ค้นหา"}
                      </p>
                      {customerNameSearchTerm && (
                        <p className="text-xs text-muted-foreground mt-1">
                          ลองค้นหาด้วยคำอื่น
                        </p>
                      )}
                    </div>
                  ) : (
                    filteredStudentOptions.map((option) => (
                      <SelectItem
                        key={option.value}
                        value={option.value}
                        className="cursor-pointer hover:bg-accent px-3 py-2.5 transition-colors"
                      >
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{option.label}</span>
                        </div>
                      </SelectItem>
                    ))
                  )}
                </div>
              </SelectContent>
            </Select>
          </div>

          <div className="relative">
            <label className="block text-sm font-medium text-foreground mb-2">
              <div className="flex items-center space-x-2">
                <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                <span>เบอร์โทรศัพท์</span>
              </div>
            </label>
            <InputField
              label=""
              name="phone"
              value={formData.phone}
              onChange={handleLocalChange}
              onBlur={handlePhoneBlur} // Add onBlur event handler
              type="tel" // ใช้ type="tel" เพื่อให้เป็น InputField สำหรับตัวเลขที่คล้ายเบอร์โทร
              placeholder="กรุณากรอกเบอร์โทรศัพท์"
              className="mb-0"
              inputClassName="w-full h-9 px-2 border-2 border-border rounded-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all"
              labelClassName="hidden"
              required={true}
              maxlength={10}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="relative">
            <label className="block text-sm font-medium text-foreground mb-2">
              <div className="flex items-center space-x-2">
                <UserCheck className="w-4 h-4 text-muted-foreground" />
                <span>ครูที่ปรึกษา</span>
              </div>
            </label>
            <InputField
              label=""
              name="advisor"
              value={formData.advisor}
              onChange={handleLocalChange}
              onBlur={(e) => validateFieldOnBlur("advisor", e.target.value)}
              disabled={(!!formData.classroom_id && !!formData.advisor) || isFullyLocked}
              className="mb-0"
              inputClassName="w-full h-10 px-3 border-2 border-border rounded-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all disabled:bg-muted disabled:text-muted-foreground"
              labelClassName="hidden"
            />
          </div>

          <div className="relative">
            <label className="block text-sm font-medium text-foreground mb-2">
              <div className="flex items-center space-x-2">
                <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                <span>วันที่รับเค้ก</span>
              </div>
            </label>
            <div className="flex space-x-2">
              <InputField
                label=""
                name="selectedDay"
                value={selectedDay}
                onChange={handleDayChange}
                type="tel"
                placeholder="วัน (1-31)"
                className="mb-0"
                inputClassName="w-full text-center h-9 px-2 border-2 border-border rounded-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all"
                labelClassName="hidden"
                maxlength={2}
              />
              {/* InputField สำหรับ 'วัน' สิ้นสุด */}

                            <Select
                onValueChange={handleMonthChange}
                value={selectedMonth}
              >
                <SelectTrigger className="w-1/3 h-10 px-3 border-2 border-border rounded-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all bg-card">
                  <SelectValue placeholder="เดือน" />
                </SelectTrigger>
                <SelectContent>
                  {monthOptions
                    .filter((month) => month.value === selectedMonth)
                    .map((month) => (
                      <SelectItem
                        key={month.value}
                        value={month.value.toString()}
                      >
                        {month.label}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>

              <Select
                onValueChange={handleYearChange}
                value={selectedYear}
              >
                <SelectTrigger className="w-1/3 h-10 px-3 border-2 border-border rounded-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all bg-card">
                  <SelectValue placeholder="ปี" />
                </SelectTrigger>
                <SelectContent>
                  {/* 3. ✅ แก้ไข: แสดงผลเป็นปี พ.ศ. */}
                  {yearDisplayOptions
                    .filter((year) => year.value === selectedYear)
                    .map((year) => (
                      <SelectItem key={year.value} value={year.value}>
                        {year.label}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="relative">
            <label className="block text-sm font-medium text-foreground mb-2">
              <div className="flex items-center space-x-2">
                <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                <span>ช่วงเวลารับเค้ก</span>
              </div>
            </label>
            <Select
              onValueChange={handlePickupTimeSlotSelectChange}
              value={formData.time_type || ""}
            >
              <SelectTrigger className="w-full h-10 px-3 border-2 border-border rounded-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all bg-card">
                <SelectValue>
                  {formData.time_type === "morning"
                    ? "เช้า ( 08:00 น. - 12:00 น.)"
                    : formData.time_type === "afternoon"
                    ? "บ่าย ( 13:00 น. - 18:00 น.)"
                    : "เลือกช่วงเวลารับเค้ก"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {timeSlotOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeneralInfoSection;
