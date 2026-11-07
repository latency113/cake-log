import React, { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import InputField from "@/components/common/InputField";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  CheckCircle,
  Loader2,
  Eye,
  EyeOff,
  User as UserIcon,
  GraduationCap,
} from "lucide-react";
import type { User, Teacher, Department } from "@/types";
import type { InputChangeEvent } from "@/types/common";
import { showToastSuccess, showToastError } from "@/utils/alerts";
import { getTeachers, createTeacher } from "@/utils/api/teachers";
import { getDepartments } from "@/utils/api/departments";

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (user: Partial<User>) => Promise<boolean>;
  currentUser?: User;
  onCheckUsernameAvailability?: (
    username: string,
    currentUserId?: string
  ) => Promise<boolean>;
}

const UserFormModal: React.FC<UserFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  currentUser,
  onCheckUsernameAvailability,
}) => {
  const [formData, setFormData] = useState<
    Omit<User, "id" | "createdAt" | "updatedAt"> & { password: string }
  >({
    firstname: "",
    lastname: "",
    username: "",
    password: "",
    email: "",
    role: "USER",
    teacher_id: null,
  });

  // Account Type: REGULAR (ผู้ใช้งานทั่วไป) or TEACHER (ครูที่ต้องกรอกข้อมูลเค้ก)
  const [userType, setUserType] = useState<"REGULAR" | "TEACHER">("REGULAR");

  // Teacher linking states
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoadingTeachers, setIsLoadingTeachers] = useState(false);
  const [teacherMode, setTeacherMode] = useState<"EXISTING" | "NEW">("EXISTING");
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>("");
  const [newTeacherName, setNewTeacherName] = useState("");
  const [newTeacherDepartmentId, setNewTeacherDepartmentId] = useState("");

  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [usernameCheckStatus, setUsernameCheckStatus] = useState<
    "idle" | "checking" | "available" | "unavailable"
  >("idle");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Load teachers and departments when modal opens
  useEffect(() => {
    if (isOpen) {
      const loadReferenceData = async () => {
        setIsLoadingTeachers(true);
        try {
          const [teachersData, deptRes] = await Promise.all([
            getTeachers(),
            getDepartments(1, 9999),
          ]);
          setTeachers(teachersData || []);
          setDepartments(deptRes?.data || []);
        } catch (err) {
          console.error("Failed to load reference data in UserFormModal:", err);
        } finally {
          setIsLoadingTeachers(false);
        }
      };
      loadReferenceData();
    }
  }, [isOpen]);

  // Reset form when modal opens/closes or currentUser changes
  useEffect(() => {
    if (isOpen) {
      if (currentUser) {
        const { id, createdAt, updatedAt, ...rest } = currentUser;
        const hasTeacher = Boolean(currentUser.teacher_id || currentUser.teacher);
        setUserType(hasTeacher ? "TEACHER" : "REGULAR");
        setSelectedTeacherId(currentUser.teacher_id || currentUser.teacher?.id || "");
        setTeacherMode("EXISTING");
        setNewTeacherName("");
        setNewTeacherDepartmentId("");
        setFormData({
          ...rest,
          teacher_id: currentUser.teacher_id || currentUser.teacher?.id || null,
          password: "",
        });
      } else {
        setUserType("REGULAR");
        setSelectedTeacherId("");
        setTeacherMode("EXISTING");
        setNewTeacherName("");
        setNewTeacherDepartmentId("");
        setFormData({
          firstname: "",
          lastname: "",
          username: "",
          password: "",
          email: "",
          role: "USER",
          teacher_id: null,
        });
      }
      setUsernameError(null);
      setUsernameCheckStatus("idle");
      setIsSubmitting(false);
      setShowPassword(false);
    }
  }, [currentUser, isOpen]);

  // Handle switching user type
  const handleUserTypeSelect = (type: "REGULAR" | "TEACHER") => {
    setUserType(type);
    if (type === "TEACHER") {
      setFormData((prev) => ({
        ...prev,
        role: "USER",
        teacher_id: selectedTeacherId || null,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        teacher_id: null,
      }));
    }
  };

  // When teacher is selected from existing teachers
  const handleTeacherSelectChange = (teacherId: string) => {
    setSelectedTeacherId(teacherId);
    setFormData((prev) => ({ ...prev, teacher_id: teacherId, role: "USER" }));

    const foundTeacher = teachers.find((t) => t.id === teacherId);
    if (foundTeacher) {
      // Auto-populate firstname and lastname from teacher name if empty or updating
      const clean = foundTeacher.name
        .replace(/^(นาย|นางสาว|นาง|ดร\.|อาจารย์|อ\.|ผศ\.|รศ\.)\s*/g, "")
        .trim();
      const parts = clean.split(/\s+/);
      const fn = parts[0] || "";
      const ln = parts.slice(1).join(" ") || "";

      setFormData((prev) => ({
        ...prev,
        firstname: fn || prev.firstname,
        lastname: ln || prev.lastname,
      }));
    }
  };

  // Debounced username availability check
  const checkUsernameAvailability = useCallback(
    async (username: string) => {
      if (!onCheckUsernameAvailability || !username.trim()) {
        setUsernameCheckStatus("idle");
        setUsernameError(null);
        return;
      }

      const originalUsername = currentUser?.username;

      if (currentUser && username === originalUsername) {
        setUsernameCheckStatus("idle");
        setUsernameError(null);
        return;
      }

      setIsCheckingUsername(true);
      setUsernameCheckStatus("checking");
      setUsernameError(null);

      try {
        const isAvailable = await onCheckUsernameAvailability(
          username,
          currentUser?.id
        );

        if (isAvailable) {
          setUsernameCheckStatus("available");
          setUsernameError(null);
        } else {
          setUsernameCheckStatus("unavailable");
          setUsernameError("ชื่อผู้ใช้นี้ถูกใช้แล้ว กรุณาเลือกชื่อผู้ใช้อื่น");
        }
      } catch (error) {
        console.error("Error checking username availability:", error);
        setUsernameCheckStatus("unavailable");
        setUsernameError("ไม่สามารถตรวจสอบชื่อผู้ใช้ได้ กรุณาลองใหม่อีกครั้ง");
      } finally {
        setIsCheckingUsername(false);
      }
    },
    [onCheckUsernameAvailability, currentUser]
  );

  // Debounce username check
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (!formData.username) {
        setUsernameError(null);
        setUsernameCheckStatus("idle");
        return;
      }

      if (formData.username.length > 0 && formData.username.length < 3) {
        setUsernameError("ชื่อผู้ใช้ต้องมีอย่างน้อย 3 ตัวอักษร");
        setUsernameCheckStatus("unavailable");
        return;
      }

      const englishOnlyRegex = /^[a-zA-Z0-9]*$/;
      if (!englishOnlyRegex.test(formData.username)) {
        setUsernameError("ชื่อผู้ใช้ต้องเป็นภาษาอังกฤษหรือตัวเลขเท่านั้น");
        setUsernameCheckStatus("unavailable");
        return;
      }

      if (formData.username && formData.username.length >= 3) {
        checkUsernameAvailability(formData.username);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [formData.username, checkUsernameAvailability]);

  const validateEmail = (email: string) => {
    if (!email) {
      setEmailError(null);
      return;
    }

    if (email.length > 254) {
      setEmailError("อีเมลต้องมีความยาวไม่เกิน 254 ตัวอักษร");
      return;
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      setEmailError("รูปแบบอีเมลไม่ถูกต้อง");
      return;
    }

    const parts = email.split("@");
    const localPart = parts[0];
    const domainPart = parts[1];

    if (localPart.length > 30) {
      setEmailError("ส่วนชื่อผู้ใช้อีเมลต้องมีความยาวไม่เกิน 30 ตัวอักษร");
      return;
    }

    if (domainPart.length > 50) {
      setEmailError("ส่วนโดเมนอีเมลต้องมีความยาวไม่เกิน 50 ตัวอักษร");
      return;
    }

    setEmailError(null);
  };

  const handleChange = (e: InputChangeEvent) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "username") {
      setUsernameCheckStatus("idle");
      setUsernameError(null);
    } else if (name === "email") {
      validateEmail(value);
    }
  };

  const handleRoleChange = (
    value: "ADMIN" | "USER" | "OFFICER1" | "OFFICER2" | "SUPERADMIN"
  ) => {
    setFormData((prev) => ({ ...prev, role: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser && onCheckUsernameAvailability && formData.username) {
      setIsCheckingUsername(true);
      try {
        const isAvailable = await onCheckUsernameAvailability(
          formData.username
        );
        if (!isAvailable) {
          setUsernameError("ชื่อผู้ใช้นี้ถูกใช้แล้ว กรุณาเลือกชื่อผู้ใช้อื่น");
          setUsernameCheckStatus("unavailable");
          setIsCheckingUsername(false);
          return;
        }
      } catch (error) {
        console.error("Error checking username before save:", error);
        setUsernameError("ไม่สามารถตรวจสอบชื่อผู้ใช้ได้ กรุณาลองใหม่อีกครั้ง");
        setIsCheckingUsername(false);
        return;
      }
      setIsCheckingUsername(false);
    }

    setIsSubmitting(true);

    try {
      let finalTeacherId = userType === "TEACHER" ? selectedTeacherId : null;

      // If user chose to create a new teacher record
      if (userType === "TEACHER" && teacherMode === "NEW") {
        if (!newTeacherName.trim()) {
          showToastError({ title: "กรุณาระบุชื่อครู" });
          setIsSubmitting(false);
          return;
        }
        if (!newTeacherDepartmentId) {
          showToastError({ title: "กรุณาเลือกแผนกวิชาของครู" });
          setIsSubmitting(false);
          return;
        }

        const createdTeacher = await createTeacher({
          name: newTeacherName.trim(),
          department_id: newTeacherDepartmentId,
        });
        finalTeacherId = createdTeacher.id;
      }

      let userDataToSave: Partial<User> = {};

      if (currentUser) {
        userDataToSave.id = currentUser.id;

        const stringFields: Array<
          "firstname" | "lastname" | "username" | "email"
        > = ["firstname", "lastname", "username", "email"];
        stringFields.forEach((key) => {
          if (formData[key] !== currentUser[key]) {
            userDataToSave[key] = formData[key] as string;
          }
        });

        if (userType === "TEACHER") {
          userDataToSave.role = "USER";
        } else if (formData.role !== currentUser.role) {
          userDataToSave.role = formData.role;
        }

        if (formData.password !== "") {
          userDataToSave.password = formData.password;
        }

        // Always update teacher_id
        userDataToSave.teacher_id = finalTeacherId;
      } else {
        userDataToSave = {
          ...formData,
          role: userType === "TEACHER" ? "USER" : formData.role,
          teacher_id: finalTeacherId,
        };
      }

      console.log("User data to save:", userDataToSave);
      const success = await onSave(userDataToSave);

      if (success) {
        showToastSuccess({
          title: currentUser
            ? "อัปเดตข้อมูลผู้ใช้งานสำเร็จ!"
            : userType === "TEACHER"
            ? "เพิ่มบัญชีครูกรอกข้อมูลเค้กสำเร็จ!"
            : "เพิ่มผู้ใช้งานสำเร็จ!",
        });
        onClose();
      } else {
        showToastError({
          title: currentUser
            ? "ไม่สามารถอัปเดตผู้ใช้ได้!"
            : "การดำเนินการล้มเหลว!",
          text: "กรุณาลองใหม่อีกครั้ง",
        });
      }
    } catch (error) {
      console.error("Failed to save user:", error);
      let errorMessage = "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ";

      if (error instanceof Error) {
        errorMessage = error.message;
        if (
          errorMessage.includes("Username already exists") ||
          errorMessage.includes("ชื่อผู้ใช้ถูกใช้แล้ว")
        ) {
          showToastError({
            title: "การดำเนินการล้มเหลว!",
            text: "ชื่อผู้ใช้นี้ถูกใช้แล้ว กรุณาเลือกชื่อผู้ใช้อื่น",
          });
          setUsernameError("ชื่อผู้ใช้นี้ถูกใช้แล้ว กรุณาเลือกชื่อผู้ใช้อื่น");
          setUsernameCheckStatus("unavailable");
          return;
        }
      }

      showToastError({
        title: "เกิดข้อผิดพลาดในการบันทึกข้อมูล!",
        text: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = () => {
    const basicValidation =
      formData.firstname.trim() &&
      formData.lastname.trim() &&
      formData.username.trim() &&
      formData.username.length >= 3 &&
      (!currentUser ? formData.password.trim() : true) &&
      !usernameError &&
      !emailError &&
      usernameCheckStatus !== "unavailable";

    if (!basicValidation) return false;

    if (userType === "TEACHER") {
      if (teacherMode === "EXISTING" && !selectedTeacherId) {
        return false;
      }
      if (
        teacherMode === "NEW" &&
        (!newTeacherName.trim() || !newTeacherDepartmentId)
      ) {
        return false;
      }
    }

    return true;
  };

  const roles = [
    { value: "USER", label: "ผู้ใช้งานทั่วไป" },
    { value: "OFFICER1", label: "เจ้าหน้าที่จ่ายเค้ก" },
    { value: "OFFICER2", label: "เจ้าหน้าที่จัดเค้ก" },
    { value: "ADMIN", label: "ผู้บริหาร" },
    { value: "SUPERADMIN", label: "ผู้ดูแลระบบขั้นสูงสุด" },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg md:max-w-2xl bg-background text-foreground max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {currentUser ? "แก้ไขข้อมูลผู้ใช้" : "เพิ่มผู้ใช้ใหม่"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-6 py-4">
          {/* User Type Switcher */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">
              ประเภทบัญชีผู้ใช้ *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleUserTypeSelect("REGULAR")}
                className={`flex items-start p-3.5 rounded-lg border text-left transition-all cursor-pointer ${
                  userType === "REGULAR"
                    ? "border-purple-600 bg-purple-50/70 ring-2 ring-purple-500/20 shadow-xs"
                    : "border-gray-200 hover:border-gray-300 bg-white"
                }`}
              >
                <div
                  className={`p-2 rounded-md mr-3 ${
                    userType === "REGULAR"
                      ? "bg-purple-600 text-white"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  <UserIcon className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-semibold text-sm text-gray-900">
                    ผู้ใช้งานทั่วไป
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    ผู้ใช้งานระบบทั่วไป กำหนดบทบาทได้ (เจ้าหน้าที่, แอดมิน, ฯลฯ)
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleUserTypeSelect("TEACHER")}
                className={`flex items-start p-3.5 rounded-lg border text-left transition-all cursor-pointer ${
                  userType === "TEACHER"
                    ? "border-amber-600 bg-amber-50/70 ring-2 ring-amber-500/20 shadow-xs"
                    : "border-gray-200 hover:border-gray-300 bg-white"
                }`}
              >
                <div
                  className={`p-2 rounded-md mr-3 ${
                    userType === "TEACHER"
                      ? "bg-amber-600 text-white"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-semibold text-sm text-gray-900">
                    ครูที่ต้องกรอกข้อมูลเค้ก
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    ครูประจำชั้น/ที่ปรึกษา สำหรับเข้าสู่ระบบสั่งจองเค้กของห้องเรียน
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Teacher Selection Section (Visible only when userType is TEACHER) */}
          {userType === "TEACHER" && (
            <div className="p-4 rounded-lg bg-amber-50/70 border border-amber-200 space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center text-amber-900 font-semibold text-sm">
                  <GraduationCap className="w-4 h-4 mr-2 text-amber-600" />
                  ข้อมูลครูผู้สั่งจองเค้ก
                </div>
                <div className="flex gap-1 text-xs bg-amber-100/70 p-1 rounded-md">
                  <button
                    type="button"
                    onClick={() => setTeacherMode("EXISTING")}
                    className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                      teacherMode === "EXISTING"
                        ? "bg-white font-medium shadow-xs text-amber-900"
                        : "text-amber-700 hover:text-amber-900"
                    }`}
                  >
                    เลือกจากรายชื่อครู
                  </button>
                  <button
                    type="button"
                    onClick={() => setTeacherMode("NEW")}
                    className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                      teacherMode === "NEW"
                        ? "bg-white font-medium shadow-xs text-amber-900"
                        : "text-amber-700 hover:text-amber-900"
                    }`}
                  >
                    + เพิ่มครูใหม่
                  </button>
                </div>
              </div>

              {teacherMode === "EXISTING" ? (
                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-700">
                    เลือกครูในระบบ *
                  </label>
                  {isLoadingTeachers ? (
                    <div className="flex items-center text-sm text-gray-500 py-2">
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      กำลังโหลดรายชื่อครู...
                    </div>
                  ) : teachers.length === 0 ? (
                    <div className="text-xs text-amber-800 bg-amber-100/60 p-3 rounded border border-amber-300">
                      ยังไม่มีข้อมูลครูในระบบของปีนี้ คุณสามารถคลิกปุ่ม{" "}
                      <b>"+ เพิ่มครูใหม่"</b> ด้านบนเพื่อสร้างข้อมูลครูได้ทันที
                    </div>
                  ) : (
                    <Select
                      value={selectedTeacherId}
                      onValueChange={handleTeacherSelectChange}
                    >
                      <SelectTrigger className="w-full bg-white">
                        <SelectValue placeholder="-- เลือกครูจากรายชื่อ --" />
                      </SelectTrigger>
                      <SelectContent className="max-h-60">
                        {teachers.map((t) => (
                          <SelectItem key={t.id} value={t.id}>
                            {t.name}{" "}
                            {t.department ? `(${t.department.name})` : ""}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="text-xs font-medium text-gray-700 block mb-1">
                      ชื่อ-นามสกุลครู *
                    </label>
                    <input
                      type="text"
                      placeholder="เช่น อาจารย์ สมชาย ใจดี"
                      value={newTeacherName}
                      onChange={(e) => {
                        const val = e.target.value;
                        setNewTeacherName(val);
                        const clean = val
                          .replace(
                            /^(นาย|นางสาว|นาง|ดร\.|อาจารย์|อ\.|ผศ\.|รศ\.)\s*/g,
                            ""
                          )
                          .trim();
                        const parts = clean.split(/\s+/);
                        if (parts.length > 0) {
                          setFormData((prev) => ({
                            ...prev,
                            firstname: parts[0] || "",
                            lastname: parts.slice(1).join(" ") || "",
                          }));
                        }
                      }}
                      className="w-full text-sm rounded-md border border-gray-300 px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-700 block mb-1">
                      แผนกวิชา *
                    </label>
                    <Select
                      value={newTeacherDepartmentId}
                      onValueChange={setNewTeacherDepartmentId}
                    >
                      <SelectTrigger className="w-full bg-white text-sm">
                        <SelectValue placeholder="-- เลือกแผนกวิชา --" />
                      </SelectTrigger>
                      <SelectContent className="max-h-60">
                        {departments.map((dept) => (
                          <SelectItem key={dept.id} value={dept.id}>
                            {dept.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
              <p className="text-xs text-amber-800">
                💡 บัญชีครูจะถูกกำหนดบทบาทเป็น <b>USER (ผู้ใช้งาน)</b>{" "}
                โดยอัตโนมัติ เพื่อให้สามารถเข้าสู่ระบบและบันทึกข้อมูลการสั่งจองเค้กได้
              </p>
            </div>
          )}

          {/* Name fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              id="firstname"
              name="firstname"
              label="ชื่อ *"
              value={formData.firstname}
              onChange={handleChange}
              required
              className="w-full"
              maxlength={30}
            />
            <InputField
              id="lastname"
              name="lastname"
              label="นามสกุล *"
              value={formData.lastname}
              onChange={handleChange}
              required
              className="w-full"
              maxlength={30}
            />
          </div>

          {/* Username field with status indicator */}
          <div className="grid gap-2">
            <div className="relative">
              <InputField
                id="username"
                name="username"
                label="ชื่อผู้ใช้ (ภาษาอังกฤษหรือตัวเลขเท่านั้น) *"
                value={formData.username}
                onChange={handleChange}
                required
                errorMessage={usernameError || ""}
                className="w-full pr-10"
                placeholder="ชื่อผู้ใช้ (อย่างน้อย 3 ตัวอักษร)"
                maxlength={20}
              />
            </div>
            {formData.username && formData.username.length > 0 && (
              <div className="mt-1">
                {usernameCheckStatus === "available" && !usernameError && (
                  <div className="flex items-center gap-1 text-sm text-green-600">
                    <CheckCircle className="h-3 w-3" />
                    <span>ชื่อผู้ใช้นี้สามารถใช้ได้</span>
                  </div>
                )}
                {usernameCheckStatus === "checking" && (
                  <div className="flex items-center gap-1 text-sm text-blue-600">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    <span>กำลังตรวจสอบชื่อผู้ใช้...</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Password field */}
          <div className="relative">
            <InputField
              id="password"
              name="password"
              label={
                currentUser
                  ? "รหัสผ่านใหม่ (เว้นว่างหากไม่ต้องการเปลี่ยน)"
                  : "รหัสผ่าน *"
              }
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={handleChange}
              required={!currentUser}
              placeholder={
                currentUser
                  ? "ใส่รหัสผ่านใหม่เฉพาะเมื่อต้องการเปลี่ยน"
                  : "รหัสผ่าน"
              }
              className="w-full"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 p-1 hover:bg-muted rounded-full transition-colors flex justify-center items-center cursor-pointer"
              aria-label={showPassword ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Eye className="h-4 w-4 text-muted-foreground" />
              )}
            </button>
          </div>

          {/* Email field */}
          <InputField
            id="email"
            name="email"
            label="อีเมล"
            value={formData.email || ""}
            onChange={handleChange}
            placeholder="example@email.com"
            className="w-full"
            errorMessage={emailError || ""}
          />

          {/* Role selection (Locked for teacher, selectable for regular) */}
          {userType === "TEACHER" ? (
            <div className="rounded-md bg-amber-50 border border-amber-200 p-3.5 text-xs text-amber-900 flex items-center justify-between">
              <div>
                <span className="font-semibold block">บทบาทในระบบ:</span>
                <span className="text-muted-foreground">
                  ผูกกับสิทธิ์การเข้าสู่ระบบเพื่อสั่งจองเค้ก
                </span>
              </div>
              <span className="bg-amber-200/80 text-amber-900 font-bold px-3 py-1.5 rounded-md text-xs">
                USER (ผู้ใช้งาน - ครูสั่งเค้ก)
              </span>
            </div>
          ) : (
            <div className="grid gap-2">
              <label
                htmlFor="role"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                บทบาท *
              </label>
              <Select
                onValueChange={handleRoleChange}
                value={formData.role}
                required={true}
              >
                <SelectTrigger id="role" className="w-full">
                  <SelectValue placeholder="เลือกบทบาท" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.value} value={role.value}>
                      {role.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <DialogFooter className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              ยกเลิก
            </Button>
            <Button
              type="submit"
              disabled={!isFormValid() || isCheckingUsername || isSubmitting}
              className={`min-w-[120px] ${
                userType === "TEACHER"
                  ? "bg-amber-600 hover:bg-amber-700 text-white"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  กำลังบันทึก...
                </>
              ) : currentUser ? (
                "บันทึกการเปลี่ยนแปลง"
              ) : userType === "TEACHER" ? (
                "เพิ่มบัญชีครู"
              ) : (
                "เพิ่มผู้ใช้"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UserFormModal;
