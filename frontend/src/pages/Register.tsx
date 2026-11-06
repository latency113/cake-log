import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
  UserPlus,
  Eye,
  EyeOff,
  CheckCircle,
  Loader2,
  GraduationCap,
  School,
  UserCheck,
  ArrowLeft,
  AlertCircle,
  Sparkles,
  Info,
} from "lucide-react";
import InputField from "../components/common/InputField";
import type { InputChangeEvent } from "@/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  getAuthClassrooms,
  checkUsernameAvailability,
  registerUser,
  type AuthClassroom,
} from "@/utils/api/auth";
import { showAlertSuccess, showAlertError } from "@/utils/alerts";

// Clean and normalize Thai names (remove titles like นาย/นางสาว/นาง/ดร. and all whitespace)
export const normalizeThaiName = (str: string): string => {
  if (!str) return "";
  return str
    .replace(/^(นาย|นางสาว|นาง|ดร\.|อาจารย์|อ\.|ผศ\.|รศ\.)\s*/g, "")
    .replace(/\s+/g, "")
    .trim()
    .toLowerCase();
};

// Check if user's entered name matches teacher's name
export const matchTeacherName = (
  firstname: string,
  lastname: string,
  teacherName: string
): boolean => {
  if (!teacherName) return false;
  const normUser = normalizeThaiName(`${firstname}${lastname}`);
  const normTeacher = normalizeThaiName(teacherName);
  if (!normUser || !normTeacher) return false;

  // Exact normalized match
  if (normUser === normTeacher) return true;

  // Split teacher's name into first and last name parts
  const teacherClean = teacherName
    .replace(/^(นาย|นางสาว|นาง|ดร\.|อาจารย์|อ\.|ผศ\.|รศ\.)\s*/g, "")
    .trim();
  const parts = teacherClean.split(/\s+/).filter(Boolean);
  const tFirst = normalizeThaiName(parts[0] || "");
  const tLast = normalizeThaiName(parts.slice(1).join("") || "");

  const uFirst = normalizeThaiName(firstname);
  const uLast = normalizeThaiName(lastname);

  if (uFirst && uLast && tFirst === uFirst && tLast === uLast) return true;

  // Substring inclusion check if name is sufficiently long
  if (normTeacher.includes(normUser) || normUser.includes(normTeacher)) {
    if (uFirst.length >= 2 && (uLast.length >= 2 || !uLast)) {
      return true;
    }
  }

  return false;
};

// Format classroom label for display
export const formatClassroomLabel = (c: AuthClassroom): string => {
  const dept = c.department?.name || "";
  const level = c.grade_level?.level === "VOCATIONAL" ? "ปวช." : "ปวส.";
  const year = c.grade_level?.year || "";
  return `${dept} ${level} ${year} ห้อง ${c.name}`;
};

const Register: React.FC = () => {
  const navigate = useNavigate();

  // Classroom data state
  const [classrooms, setClassrooms] = useState<AuthClassroom[]>([]);
  const [isLoadingClassrooms, setIsLoadingClassrooms] = useState(true);

  // Classroom filter cascade (for manual selection fallback)
  const [isManualSelection, setIsManualSelection] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<string>("");
  const [selectedGradeKey, setSelectedGradeKey] = useState<string>("");
  const [selectedClassroomId, setSelectedClassroomId] = useState<string>("");

  // Form input state
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    username: "",
    password: "",
    confirmPassword: "",
    email: "",
  });

  // UI / validation state
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [usernameCheckStatus, setUsernameCheckStatus] = useState<
    "idle" | "checking" | "available" | "unavailable"
  >("idle");

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const backgroundImages = [
    "/assets/cake.jpg",
    "/assets/cake2.jpg",
    "/assets/cake3.jpg",
    "/assets/cake4.jpg",
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % backgroundImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [backgroundImages.length]);

  const titleText = "Cake Log System";
  const descText =
    "ระบบลงทะเบียนครูที่ปรึกษาและตัวแทนห้องเรียน ตรวจสอบและเชื่อมต่อห้องเรียนอัตโนมัติ รวดเร็ว และแม่นยำ";

  const typewriterVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const characterVariants = {
    hidden: { opacity: 0, y: 5 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.1,
      },
    },
  };

  // Load classrooms on mount
  useEffect(() => {
    const fetchClassrooms = async () => {
      try {
        setIsLoadingClassrooms(true);
        const data = await getAuthClassrooms();
        setClassrooms(data);
      } catch (error) {
        console.error("Failed to load classrooms:", error);
        showAlertError({
          title: "เกิดข้อผิดพลาด",
          text: "ไม่สามารถดึงข้อมูลห้องเรียนได้ กรุณาลองใหม่อีกครั้ง",
        });
      } finally {
        setIsLoadingClassrooms(false);
      }
    };

    fetchClassrooms();
  }, []);

  // Classrooms matching entered teacher's name (auto-detection)
  const matchingClassrooms = useMemo(() => {
    const fn = formData.firstname.trim();
    const ln = formData.lastname.trim();
    if (!fn || classrooms.length === 0) return [];

    // When both first and last name are entered
    if (fn && ln) {
      return classrooms.filter((c) =>
        c.teacher ? matchTeacherName(fn, ln, c.teacher.name) : false
      );
    }

    // When only firstname is entered (at least 3 characters)
    if (fn.length >= 3 && !ln) {
      const uFirst = normalizeThaiName(fn);
      return classrooms.filter((c) => {
        if (!c.teacher) return false;
        const tClean = c.teacher.name
          .replace(/^(นาย|นางสาว|นาง|ดร\.|อาจารย์|อ\.|ผศ\.|รศ\.)\s*/g, "")
          .trim();
        const tFirst = normalizeThaiName(tClean.split(/\s+/)[0] || "");
        return tFirst === uFirst;
      });
    }

    return [];
  }, [formData.firstname, formData.lastname, classrooms]);

  // Auto-update selected classroom when matchingClassrooms change
  useEffect(() => {
    if (isManualSelection) return;

    if (matchingClassrooms.length === 1) {
      setSelectedClassroomId(matchingClassrooms[0].id);
    } else if (matchingClassrooms.length > 1) {
      if (!matchingClassrooms.some((c) => c.id === selectedClassroomId)) {
        setSelectedClassroomId(matchingClassrooms[0].id);
      }
    } else {
      setSelectedClassroomId("");
    }
  }, [matchingClassrooms, isManualSelection, selectedClassroomId]);

  // Unique departments from classrooms (for manual fallback)
  const departments = useMemo(() => {
    const deptMap = new Map<string, string>();
    classrooms.forEach((c) => {
      if (c.department) {
        deptMap.set(c.department.id, c.department.name);
      }
    });
    return Array.from(deptMap.entries()).map(([id, name]) => ({ id, name }));
  }, [classrooms]);

  // Grade levels filtered by selected department (for manual fallback)
  const gradeLevels = useMemo(() => {
    if (!selectedDepartment) return [];
    const gradeMap = new Map<string, { key: string; label: string }>();

    classrooms
      .filter((c) => c.department?.id === selectedDepartment)
      .forEach((c) => {
        if (c.grade_level) {
          const key = `${c.grade_level.level}_${c.grade_level.year}`;
          const levelName =
            c.grade_level.level === "VOCATIONAL" ? "ปวช." : "ปวส.";
          const label = `${levelName} ${c.grade_level.year}`;
          gradeMap.set(key, { key, label });
        }
      });

    return Array.from(gradeMap.values()).sort((a, b) =>
      a.label.localeCompare(b.label, "th")
    );
  }, [classrooms, selectedDepartment]);

  // Classrooms filtered by selected department and grade level (for manual fallback)
  const filteredClassrooms = useMemo(() => {
    if (!selectedDepartment || !selectedGradeKey) return [];
    const [level, yearStr] = selectedGradeKey.split("_");
    const year = parseInt(yearStr, 10);

    return classrooms
      .filter(
        (c) =>
          c.department?.id === selectedDepartment &&
          c.grade_level?.level === level &&
          c.grade_level?.year === year
      )
      .sort((a, b) => a.name.localeCompare(b.name, "th", { numeric: true }));
  }, [classrooms, selectedDepartment, selectedGradeKey]);

  // Active selected classroom
  const selectedClassroom = useMemo(() => {
    return classrooms.find((c) => c.id === selectedClassroomId);
  }, [classrooms, selectedClassroomId]);

  // Debounced username check
  const [isCheckingUsername, setIsCheckingUsernameState] = useState(false);

  const checkAvailability = useCallback(async (username: string) => {
    if (!username.trim() || username.length < 3) return;

    setIsCheckingUsernameState(true);
    setUsernameCheckStatus("checking");
    setUsernameError(null);

    try {
      const isAvailable = await checkUsernameAvailability(username);
      if (isAvailable) {
        setUsernameCheckStatus("available");
        setUsernameError(null);
      } else {
        setUsernameCheckStatus("unavailable");
        setUsernameError("ชื่อผู้ใช้นี้ถูกใช้งานแล้ว");
      }
    } catch {
      setUsernameCheckStatus("unavailable");
      setUsernameError("ไม่สามารถตรวจสอบชื่อผู้ใช้ได้");
    } finally {
      setIsCheckingUsernameState(false);
    }
  }, []);

  useEffect(() => {
    if (!formData.username) {
      setUsernameError(null);
      setUsernameCheckStatus("idle");
      return;
    }

    if (formData.username.length < 3) {
      setUsernameError("ชื่อผู้ใช้ต้องมีอย่างน้อย 3 ตัวอักษร");
      setUsernameCheckStatus("unavailable");
      return;
    }

    const englishOnlyRegex = /^[a-zA-Z0-9_]+$/;
    if (!englishOnlyRegex.test(formData.username)) {
      setUsernameError("ชื่อผู้ใช้ต้องเป็นตัวอักษรภาษาอังกฤษ ตัวเลข หรือ _ เท่านั้น");
      setUsernameCheckStatus("unavailable");
      return;
    }

    const timer = setTimeout(() => {
      checkAvailability(formData.username);
    }, 500);

    return () => clearTimeout(timer);
  }, [formData.username, checkAvailability]);

  // Handle form change
  const handleChange = (e: InputChangeEvent) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Reset child dropdowns when department changes (manual mode)
  const handleDepartmentChange = (deptId: string) => {
    setSelectedDepartment(deptId);
    setSelectedGradeKey("");
    setSelectedClassroomId("");
  };

  // Reset classroom when grade changes (manual mode)
  const handleGradeChange = (gradeKey: string) => {
    setSelectedGradeKey(gradeKey);
    setSelectedClassroomId("");
  };

  // Validation
  const isPasswordMatching =
    formData.password &&
    formData.confirmPassword &&
    formData.password === formData.confirmPassword;

  const hasValidClassroom = Boolean(
    isManualSelection
      ? selectedClassroomId && selectedClassroom?.teacher?.id
      : (matchingClassrooms.length === 1 && matchingClassrooms[0]?.teacher?.id) ||
        (matchingClassrooms.length > 1 && selectedClassroomId && selectedClassroom?.teacher?.id)
  );

  const isFormValid =
    formData.firstname.trim() !== "" &&
    formData.lastname.trim() !== "" &&
    formData.username.trim().length >= 3 &&
    usernameCheckStatus === "available" &&
    !usernameError &&
    formData.password.length >= 6 &&
    isPasswordMatching &&
    hasValidClassroom;

  // Handle Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const fn = formData.firstname.trim();
    const ln = formData.lastname.trim();

    if (!fn || !ln) {
      showAlertError({
        title: "กรุณากรอกชื่อและนามสกุล",
        text: "โปรดระบุชื่อจริงและนามสกุลเพื่อตรวจสอบห้องเรียนที่เป็นครูที่ปรึกษา",
      });
      return;
    }

    let targetClassroomId = selectedClassroomId;

    // Check which classroom's advisor matches user's name
    if (!isManualSelection) {
      const matches = classrooms.filter((c) =>
        c.teacher ? matchTeacherName(fn, ln, c.teacher.name) : false
      );

      if (matches.length === 0) {
        showAlertError({
          title: "ไม่พบห้องเรียนที่ตรงกับชื่อครูที่ปรึกษา",
          text: `ไม่พบข้อมูลห้องเรียนที่มีครูที่ปรึกษาตรงกับชื่อ "${fn} ${ln}" กรุณาตรวจสอบการสะกดชื่อ-นามสกุล หรือกดเลือกห้องเรียนด้วยตนเอง`,
        });
        return;
      }

      if (matches.length === 1) {
        targetClassroomId = matches[0].id;
      } else if (!targetClassroomId || !matches.some((m) => m.id === targetClassroomId)) {
        showAlertError({
          title: "กรุณาเลือกห้องเรียน",
          text: `ตรวจพบว่าท่านเป็นครูที่ปรึกษาจำนวน ${matches.length} ห้องเรียน กรุณาเลือกห้องเรียนที่ต้องการลงทะเบียน`,
        });
        return;
      }
    } else {
      if (!targetClassroomId || !selectedClassroom) {
        showAlertError({
          title: "กรุณาเลือกห้องเรียน",
          text: "โปรดเลือกแผนก ระดับชั้น และห้องเรียนเพื่อเชื่อมต่อกับครูประจำชั้น",
        });
        return;
      }
    }

    const finalClassroom = classrooms.find((c) => c.id === targetClassroomId);

    if (!finalClassroom?.teacher?.id) {
      showAlertError({
        title: "ไม่พบครูประจำชั้น",
        text: "ห้องเรียนนี้ยังไม่มีการระบุครูประจำชั้นในระบบ กรุณาติดต่อผู้ดูแลระบบ",
      });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      showAlertError({
        title: "รหัสผ่านไม่ตรงกัน",
        text: "กรุณาตรวจสอบการยืนยันรหัสผ่านอีกครั้ง",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await registerUser({
        firstname: fn,
        lastname: ln,
        username: formData.username.trim(),
        password: formData.password,
        email: formData.email.trim() || undefined,
        classroom_id: targetClassroomId,
      });

      const teacherName = finalClassroom.teacher?.name || `${fn} ${ln}`;
      const roomDesc = formatClassroomLabel(finalClassroom);

      showAlertSuccess({
        title: "สมัครสมาชิกสำเร็จ!",
        text: `เชื่อมต่อกับครูที่ปรึกษา (${teacherName}) ห้อง ${roomDesc} เรียบร้อยแล้ว`,
        showConfirmButton: true,
      });

      navigate({ to: "/login" });
    } catch (error: any) {
      showAlertError({
        title: "การสมัครสมาชิกล้มเหลว",
        text: error.message || "เกิดข้อผิดพลาดในการลงทะเบียน กรุณาลองใหม่อีกครั้ง",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white dark:bg-slate-950 overflow-hidden transition-colors duration-300">
      <div className="grid grid-cols-1 lg:grid-cols-12 flex-1">
        {/* Left Panel - System Brand Section with Diagonal Split and Rotating Background */}
        <div className="hidden lg:flex lg:col-span-5 bg-blue-900 dark:bg-blue-950 relative overflow-hidden items-center justify-center p-12">
          {/* Rotating Background Image Layer with Crossfade */}
          <div className="absolute inset-0 z-0">
            <AnimatePresence mode="wait">
              <motion.img
                key={currentImageIndex}
                src={backgroundImages[currentImageIndex]}
                alt="background"
                className="w-full h-full object-cover"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.5 }}
              />
            </AnimatePresence>
            {/* Subtle Overlay */}
            <div className="absolute inset-0 bg-blue-950/40 dark:bg-slate-950/60"></div>
          </div>

          {/* Diagonal Split Overlay (System Blue Section) */}
          <div
            className="absolute inset-0 bg-blue-600/90 dark:bg-blue-700/80 z-10"
            style={{ clipPath: "polygon(100% 0, 100% 100%, 35% 100%, 65% 0)" }}
          >
            {/* Sharp Patterns inside the split */}
            <div className="absolute inset-0 overflow-hidden opacity-10">
              <div className="absolute top-0 right-0 w-full h-full">
                <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[120%] border-r border-white transform rotate-12"></div>
                <div className="absolute top-[20%] right-[10%] w-[40%] h-[80%] border-r border-white transform rotate-12"></div>
              </div>
            </div>
            {/* System Blue Gradient inside the split */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-700 via-transparent to-blue-500 opacity-70"></div>
          </div>

          {/* Content Overlay */}
          <motion.div
            className="relative z-20 text-white max-w-md ml-auto"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
          >
            <div className="mb-8">
              <div className="flex items-center gap-5 mb-8">
                <img
                  src="https://nc.ac.th/img/logo.png"
                  alt="logo"
                  className="w-20 h-20 object-contain drop-shadow-xl"
                />
                <motion.h1
                  className="text-3xl font-semibold drop-shadow-lg"
                  variants={typewriterVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {titleText.split("").map((char, index) => (
                    <motion.span key={index} variants={characterVariants}>
                      {char}
                    </motion.span>
                  ))}
                </motion.h1>
              </div>
            </div>

            <motion.p
              className="text-lg leading-relaxed text-blue-50 font-normal border-l-2 border-white/30 pl-6 drop-shadow-md"
              variants={typewriterVariants}
              initial="hidden"
              animate="visible"
              transition={{ delayChildren: 0.8 }}
            >
              {descText.split("").map((char, index) => (
                <motion.span key={index} variants={characterVariants}>
                  {char}
                </motion.span>
              ))}
            </motion.p>
          </motion.div>
        </div>

        {/* Right Panel - Registration Form */}
        <div className="w-full lg:col-span-7 flex items-center justify-center p-6 sm:p-12 md:p-16 bg-slate-50/50 dark:bg-slate-900/50 overflow-y-auto max-h-screen">
          <motion.div
            className="w-full max-w-xl my-auto py-4"
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{
              type: "spring",
              stiffness: 120,
              damping: 20,
              delay: 0.2,
            }}
          >
            {/* Branding for Mobile */}
            <div className="lg:hidden mb-8 flex items-center gap-4">
              <img
                src="https://nc.ac.th/img/logo.png"
                alt="logo"
                className="w-12 h-12"
              />
              <h1 className="text-2xl font-semibold text-blue-600 dark:text-blue-400 tracking-tight">
                Cake Log System
              </h1>
            </div>

            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-semibold text-slate-800 dark:text-slate-100 mb-2 tracking-tight">
                    สมัครสมาชิก
                  </h2>
                  <p className="text-slate-500 dark:text-slate-400 text-sm font-normal">
                    กรอกชื่อ-นามสกุลเพื่อตรวจสอบห้องเรียนและสร้างบัญชีผู้ใช้งาน
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => navigate({ to: "/login" })}
                  className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>เข้าสู่ระบบ</span>
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Section 1: Teacher Name & Auto-Classroom Detection */}
              <div className="rounded-lg bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 p-4 sm:p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-blue-900 dark:text-blue-300 font-semibold text-sm">
                    <GraduationCap className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span>1. ข้อมูลครูที่ปรึกษา (ตรวจสอบห้องเรียนอัตโนมัติ)</span>
                  </div>
                  {isManualSelection && (
                    <button
                      type="button"
                      onClick={() => setIsManualSelection(false)}
                      className="text-xs text-blue-600 hover:underline dark:text-blue-400 flex items-center gap-1 font-medium"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      กลับไปใช้ตรวจจับอัตโนมัติ
                    </button>
                  )}
                </div>

                {/* Firstname & Lastname Inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InputField
                    id="firstname"
                    name="firstname"
                    label="ชื่อจริง (ไม่ต้องใส่คำนำหน้า) *"
                    labelClassName="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 ml-0.5"
                    inputClassName="w-full h-11 sm:h-12 px-4 rounded-sm border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:border-blue-500 focus:ring-0 transition-all duration-200 text-sm font-normal shadow-xs dark:text-slate-200"
                    placeholder="เช่น กรกช หรือ ขวัญนภา"
                    value={formData.firstname}
                    onChange={handleChange}
                    required
                    className="w-full mb-0"
                    maxlength={30}
                  />
                  <InputField
                    id="lastname"
                    name="lastname"
                    label="นามสกุล *"
                    labelClassName="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 ml-0.5"
                    inputClassName="w-full h-11 sm:h-12 px-4 rounded-sm border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:border-blue-500 focus:ring-0 transition-all duration-200 text-sm font-normal shadow-xs dark:text-slate-200"
                    placeholder="เช่น มูลทองชุน หรือ ปุณยานุเดช"
                    value={formData.lastname}
                    onChange={handleChange}
                    required
                    className="w-full mb-0"
                    maxlength={30}
                  />
                </div>

                {/* Detection / Matching Status Display */}
                {isLoadingClassrooms ? (
                  <div className="flex items-center justify-center py-4 gap-2 text-xs text-slate-500">
                    <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                    <span>กำลังโหลดรายชื่อห้องเรียนและครูที่ปรึกษา...</span>
                  </div>
                ) : !isManualSelection ? (
                  <div className="space-y-2">
                    {/* State A: Names not yet entered */}
                    {!formData.firstname.trim() && (
                      <div className="flex items-center gap-2 p-3 text-xs rounded-md bg-blue-100/40 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-900/40">
                        <Sparkles className="w-4 h-4 shrink-0 text-blue-600 dark:text-blue-400" />
                        <span>กรอกชื่อและนามสกุลของคุณ ระบบจะค้นหาห้องเรียนที่คุณเป็นครูที่ปรึกษาให้อัตโนมัติ</span>
                      </div>
                    )}

                    {/* State B: Single Classroom Match Found */}
                    {matchingClassrooms.length === 1 && (
                      <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-3.5 rounded-lg bg-emerald-50/90 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 space-y-2.5"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                            <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                            <span>ตรวจพบห้องเรียนที่คุณเป็นครูที่ปรึกษา</span>
                          </div>
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200">
                            เชื่อมต่อสำเร็จ
                          </span>
                        </div>

                        <div className="p-3 rounded-md bg-white dark:bg-slate-900 border border-emerald-100 dark:border-emerald-900/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-700 dark:text-emerald-300 font-bold shrink-0">
                              <UserCheck className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="text-[10px] uppercase font-semibold text-emerald-600 dark:text-emerald-400">
                                ครูที่ปรึกษาในระบบ
                              </p>
                              <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                                {matchingClassrooms[0].teacher?.name}
                              </p>
                            </div>
                          </div>

                          <div className="text-left sm:text-right text-xs">
                            <p className="text-[10px] text-slate-500 dark:text-slate-400">
                              ห้องเรียนที่เชื่อมต่อ
                            </p>
                            <p className="font-bold text-emerald-700 dark:text-emerald-400">
                              {formatClassroomLabel(matchingClassrooms[0])}
                            </p>
                          </div>
                        </div>

                        <div className="flex justify-end pt-1">
                          <button
                            type="button"
                            onClick={() => setIsManualSelection(true)}
                            className="text-[11px] text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 underline"
                          >
                            ไม่ใช่ห้องเรียนของคุณ? คลิกเลือกห้องเรียนด้วยตนเอง
                          </button>
                        </div>
                      </motion.div>
                    )}

                    {/* State C: Multiple Classrooms Match Found */}
                    {matchingClassrooms.length > 1 && (
                      <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-3.5 rounded-lg bg-blue-50/90 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/60 space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-xs font-semibold text-blue-900 dark:text-blue-300">
                            <School className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            <span>ตรวจพบครูที่ปรึกษา: {matchingClassrooms[0].teacher?.name}</span>
                          </div>
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-200">
                            เป็นที่ปรึกษา {matchingClassrooms.length} ห้อง
                          </span>
                        </div>

                        {/* Informative Hint for Multi-classroom Advisors */}
                        <div className="flex items-start gap-2.5 p-3 rounded-md bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-xs text-amber-900 dark:text-amber-200 shadow-2xs">
                          <Info className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                          <div className="space-y-1.5 leading-relaxed">
                            <p className="font-semibold text-amber-950 dark:text-amber-100">
                              💡 สมัครเพียง 1 บัญชีเท่านั้น (ไม่ต้องสมัครใหม่แยกตามห้องเรียน)
                            </p>
                            <p className="text-[11.5px] text-amber-900/90 dark:text-amber-200/90">
                              • <span className="font-semibold">ต้องเลือกห้องไหน?</span> ให้เลือกห้องเรียนใดห้องหนึ่งที่คุณเป็นครูที่ปรึกษาเพื่อใช้เป็นห้องเริ่มต้นสำหรับการลงทะเบียนได้เลย
                            </p>
                            <p className="text-[11.5px] text-amber-900/90 dark:text-amber-200/90">
                              • <span className="font-semibold">ดูแลได้ครบทุกห้อง:</span> เมื่อเข้าสู่ระบบ บัญชีนี้จะเชื่อมกับชื่อครูของคุณโดยอัตโนมัติ ทำให้คุณสามารถจัดการยอดเค้กและเลือกรับสมุดจองของ<span className="font-semibold text-amber-950 dark:text-amber-100 underline decoration-amber-400">ครบทั้ง {matchingClassrooms.length} ห้องเรียน</span>ได้ในบัญชีเดียวทันที
                            </p>
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 ml-0.5">
                            เลือกห้องเรียนเริ่มต้นสำหรับการลงทะเบียน *
                          </label>
                          <Select
                            value={selectedClassroomId}
                            onValueChange={setSelectedClassroomId}
                          >
                            <SelectTrigger className="w-full h-11 sm:h-12 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-sm text-sm">
                              <SelectValue placeholder="เลือกห้องเรียนเริ่มต้น" />
                            </SelectTrigger>
                            <SelectContent>
                              {matchingClassrooms.map((c) => (
                                <SelectItem key={c.id} value={c.id}>
                                  {formatClassroomLabel(c)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="flex justify-end pt-0.5">
                          <button
                            type="button"
                            onClick={() => setIsManualSelection(true)}
                            className="text-[11px] text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 underline"
                          >
                            ไม่ใช่ห้องเรียนของคุณ? คลิกเลือกห้องเรียนด้วยตนเอง
                          </button>
                        </div>
                      </motion.div>
                    )}

                    {/* State D: Name entered but no advisor matched */}
                    {formData.firstname.trim() &&
                      formData.lastname.trim() &&
                      matchingClassrooms.length === 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="p-3.5 rounded-lg bg-amber-50/90 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 space-y-2.5"
                        >
                          <div className="flex items-start gap-2.5 text-xs text-amber-800 dark:text-amber-300">
                            <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                            <div className="space-y-1">
                              <p className="font-semibold">
                                ไม่พบห้องเรียนที่มีครูที่ปรึกษาชื่อ "{formData.firstname.trim()} {formData.lastname.trim()}"
                              </p>
                              <p className="text-[11px] text-amber-700 dark:text-amber-400">
                                กรุณาตรวจสอบการสะกดชื่อและนามสกุลให้ถูกต้อง หรือหากสะกดไม่ตรงกับฐานข้อมูล ท่านสามารถเลือกห้องเรียนด้วยตนเองได้
                              </p>
                            </div>
                          </div>
                          <div className="flex justify-end pt-1">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => setIsManualSelection(true)}
                              className="text-xs h-7.5 border-amber-300 dark:border-amber-700 hover:bg-amber-100 dark:hover:bg-amber-900/40 text-amber-900 dark:text-amber-200"
                            >
                              เลือกห้องเรียนด้วยตนเอง
                            </Button>
                          </div>
                        </motion.div>
                      )}
                  </div>
                ) : (
                  /* Manual Selection Mode (Fallback) */
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-3 pt-1 border-t border-blue-200/50 dark:border-blue-900/40"
                  >
                    <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                      <span className="font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                        เลือกห้องเรียนด้วยตนเอง:
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {/* Department Dropdown */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 ml-0.5">
                          แผนกวิชา *
                        </label>
                        <Select
                          value={selectedDepartment}
                          onValueChange={handleDepartmentChange}
                        >
                          <SelectTrigger className="w-full h-11 sm:h-12 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-sm text-sm">
                            <SelectValue placeholder="เลือกแผนก" />
                          </SelectTrigger>
                          <SelectContent>
                            {departments.map((dept) => (
                              <SelectItem key={dept.id} value={dept.id}>
                                {dept.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Grade Level Dropdown */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 ml-0.5">
                          ระดับชั้น *
                        </label>
                        <Select
                          value={selectedGradeKey}
                          onValueChange={handleGradeChange}
                          disabled={!selectedDepartment}
                        >
                          <SelectTrigger className="w-full h-11 sm:h-12 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-sm text-sm disabled:opacity-50">
                            <SelectValue placeholder={selectedDepartment ? "เลือกระดับชั้น" : "เลือกแผนกก่อน"} />
                          </SelectTrigger>
                          <SelectContent>
                            {gradeLevels.map((grade) => (
                              <SelectItem key={grade.key} value={grade.key}>
                                {grade.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Classroom Dropdown */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 ml-0.5">
                          ห้อง *
                        </label>
                        <Select
                          value={selectedClassroomId}
                          onValueChange={setSelectedClassroomId}
                          disabled={!selectedGradeKey}
                        >
                          <SelectTrigger className="w-full h-11 sm:h-12 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-sm text-sm disabled:opacity-50">
                            <SelectValue placeholder={selectedGradeKey ? "เลือกห้อง" : "เลือกระดับชั้นก่อน"} />
                          </SelectTrigger>
                          <SelectContent>
                            {filteredClassrooms.map((c) => (
                              <SelectItem key={c.id} value={c.id}>
                                ห้อง {c.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Homeroom Teacher Preview Card */}
                    {selectedClassroom && (
                      <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-3 p-3.5 rounded-md bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-700 dark:text-emerald-300 font-bold shrink-0">
                            <UserCheck className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                                ครูประจำชั้น
                              </span>
                            </div>
                            <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                              {selectedClassroom.teacher?.name || "ยังไม่มีข้อมูลครูประจำชั้น"}
                            </p>
                          </div>
                        </div>

                        <div className="text-left sm:text-right text-xs text-slate-500 dark:text-slate-400">
                          <p className="font-medium text-slate-700 dark:text-slate-300">
                            {selectedClassroom.department?.name}
                          </p>
                          <p>
                            {selectedClassroom.grade_level?.level === "VOCATIONAL" ? "ปวช." : "ปวส."}{" "}
                            {selectedClassroom.grade_level?.year} ห้อง {selectedClassroom.name}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </div>

              {/* Section 2: Account Credentials */}
              <div className="space-y-4 pt-1">
                <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-semibold text-sm">
                  <UserPlus className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span>2. ข้อมูลบัญชีผู้ใช้งานสำหรับเข้าสู่ระบบ</span>
                </div>

                {/* Username */}
                <div className="space-y-1">
                  <InputField
                    id="username"
                    name="username"
                    label="ชื่อผู้ใช้ (Username ภาษาอังกฤษ/ตัวเลข) *"
                    labelClassName="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 ml-0.5"
                    inputClassName="w-full h-11 sm:h-12 px-4 rounded-sm border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:border-blue-500 focus:ring-0 transition-all duration-200 text-sm font-normal shadow-xs dark:text-slate-200"
                    placeholder="เช่น sommai_it"
                    value={formData.username}
                    onChange={handleChange}
                    required
                    errorMessage={usernameError || ""}
                    className="w-full mb-0"
                    maxlength={20}
                  />
                  {formData.username.length >= 3 && (
                    <div className="mt-1">
                      {usernameCheckStatus === "available" && !usernameError && (
                        <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>ชื่อผู้ใช้นี้สามารถใช้ได้</span>
                        </div>
                      )}
                      {usernameCheckStatus === "checking" && (
                        <div className="flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400">
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>กำลังตรวจสอบความพร้อมใช้งาน...</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Password & Confirm Password */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="relative">
                    <InputField
                      id="password"
                      name="password"
                      label="รหัสผ่าน (อย่างน้อย 6 ตัวอักษร) *"
                      labelClassName="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 ml-0.5"
                      inputClassName="w-full h-11 sm:h-12 px-4 rounded-sm border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:border-blue-500 focus:ring-0 transition-all duration-200 text-sm font-normal shadow-xs dark:text-slate-200"
                      type={showPassword ? "text" : "password"}
                      placeholder="กำหนดรหัสผ่าน"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      className="w-full mb-0"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-8.5 p-1.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  <div className="relative">
                    <InputField
                      id="confirmPassword"
                      name="confirmPassword"
                      label="ยืนยันรหัสผ่าน *"
                      labelClassName="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 ml-0.5"
                      inputClassName="w-full h-11 sm:h-12 px-4 rounded-sm border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:border-blue-500 focus:ring-0 transition-all duration-200 text-sm font-normal shadow-xs dark:text-slate-200"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="พิมพ์รหัสผ่านอีกครั้ง"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                      errorMessage={
                        formData.confirmPassword && !isPasswordMatching
                          ? "รหัสผ่านไม่ตรงกัน"
                          : ""
                      }
                      className="w-full mb-0"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-8.5 p-1.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Email (Optional) */}
                <InputField
                  id="email"
                  name="email"
                  label="อีเมล (ไม่บังคับ)"
                  labelClassName="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 ml-0.5"
                  inputClassName="w-full h-11 sm:h-12 px-4 rounded-sm border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:border-blue-500 focus:ring-0 transition-all duration-200 text-sm font-normal shadow-xs dark:text-slate-200"
                  type="text"
                  placeholder="เช่น example@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full mb-0"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-2 space-y-4">
                <button
                  type="submit"
                  disabled={!isFormValid || isSubmitting || isCheckingUsername}
                  className="w-full bg-blue-600 text-white h-12 rounded-sm font-medium text-base
                       hover:bg-blue-700 active:bg-blue-800 transition-all duration-200
                       disabled:opacity-50 disabled:cursor-not-allowed
                       flex items-center justify-center gap-2 shadow-md shadow-blue-600/10"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                      กำลังลงทะเบียนและเชื่อมต่อข้อมูล...
                    </span>
                  ) : (
                    <>
                      <UserPlus className="w-5 h-5" />
                      <span>ยืนยันการสมัครสมาชิก</span>
                    </>
                  )}
                </button>

                {/* Link back to login */}
                <div className="text-center text-sm text-slate-500 dark:text-slate-400 pt-1">
                  มีบัญชีผู้ใช้งานอยู่แล้ว?{" "}
                  <button
                    type="button"
                    onClick={() => navigate({ to: "/login" })}
                    className="text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
                  >
                    เข้าสู่ระบบที่นี่
                  </button>
                </div>
              </div>
            </form>

            <div className="mt-12 pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-[10px] uppercase tracking-widest text-slate-300 dark:text-slate-600 font-medium">
              <span>© {new Date().getFullYear()} Cake Log System</span>
              <span>NVC Digital</span>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Register;
