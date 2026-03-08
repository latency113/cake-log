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
import { CheckCircle, Loader2, Eye, EyeOff } from "lucide-react"; // Add Eye, EyeOff
import type { User } from "@/types/user";
import type { InputChangeEvent } from "@/types/common";
import { showToastSuccess, showToastError } from "@/utils/alerts";

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
  });

  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [usernameCheckStatus, setUsernameCheckStatus] = useState<
    "idle" | "checking" | "available" | "unavailable"
  >("idle");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // New state for password visibility

  // Reset form when modal opens/closes or currentUser changes
  useEffect(() => {
    if (isOpen) {
      if (currentUser) {
        const { id, createdAt, updatedAt, ...rest } = currentUser;
        setFormData({ ...rest, password: "" });
      } else {
        setFormData({
          firstname: "",
          lastname: "",
          username: "",
          password: "",
          email: "",
          role: "USER",
        });
      }
      setUsernameError(null);
      setUsernameCheckStatus("idle");
      setIsSubmitting(false);
    }
  }, [currentUser, isOpen]);

  // Debounced username availability check
  const checkUsernameAvailability = useCallback(
    async (username: string) => {
      if (!onCheckUsernameAvailability || !username.trim()) {
        setUsernameCheckStatus("idle");
        setUsernameError(null);
        return;
      }

      const originalUsername = currentUser?.username;

      // Don't check if username hasn't changed for existing user
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
    [onCheckUsernameAvailability, currentUser, formData.username]
  );

  // Debounce username check
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (!formData.username) {
        // If username is empty, clear any existing errors and reset status
        setUsernameError(null);
        setUsernameCheckStatus("idle");
        return; // Exit early if username is empty
      }

      // Existing length validation
      if (formData.username.length > 0 && formData.username.length < 3) {
        setUsernameError("ชื่อผู้ใช้ต้องมีอย่างน้อย 3 ตัวอักษร");
        setUsernameCheckStatus("unavailable");
        return; // Exit early as it's invalid length
      }

      // New: English characters only validation
      const englishOnlyRegex = /^[a-zA-Z0-9]*$/;
      if (!englishOnlyRegex.test(formData.username)) {
        setUsernameError("ชื่อผู้ใช้ต้องเป็นภาษาอังกฤษหรือตัวเลขเท่านั้น");
        setUsernameCheckStatus("unavailable");
        return; // Exit early as it contains non-English characters
      }

      // If all local validations pass, then proceed with availability check
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

    // Overall email length check
    if (email.length > 254) {
      setEmailError("อีเมลต้องมีความยาวไม่เกิน 254 ตัวอักษร");
      return;
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      setEmailError("รูปแบบอีเมลไม่ถูกต้อง");
      return;
    }

    const parts = email.split('@');
    const localPart = parts[0];
    const domainPart = parts[1];

    // Local part length check
    if (localPart.length > 30) {
      setEmailError("ส่วนชื่อผู้ใช้อีเมลต้องมีความยาวไม่เกิน 30 ตัวอักษร");
      return;
    }

    // Domain part length check (each label in domain can be up to 63 chars, total domain up to 255)
    // This regex already handles individual label length implicitly to some extent,
    // but a more explicit check for the full domain part is good.
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

  const handleRoleChange = (value: "ADMIN" | "USER" | "OFFICER1"| "OFFICER2") => {
    setFormData((prev) => ({ ...prev, role: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Final username check before submission for new users
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
      let userDataToSave: Partial<User> = {};

      if (currentUser) {
        userDataToSave.id = currentUser.id;

        // Handle string fields
        const stringFields: Array<
          "firstname" | "lastname" | "username" | "email"
        > = ["firstname", "lastname", "username", "email"];
                  stringFields.forEach((key) => {
                    if (formData[key] !== currentUser[key]) {
                      userDataToSave[key] = formData[key] as string;
                    }
                  });
        // Handle role separately
        if (formData.role !== currentUser.role) {
          userDataToSave.role = formData.role;
        }

        // Only include password if it's not empty
        if (formData.password !== "") {
          userDataToSave.password = formData.password;
        }
      } else {
        userDataToSave = { ...formData };
      }

      console.log("User data to save:", userDataToSave); // Added console.log
      const success = await onSave(userDataToSave);

      if (success) {
        showToastSuccess({
          title: currentUser
            ? "อัปเดตข้อมูลผู้ใช้งานสำเร็จ!"
            : "เพิ่มผู้ใช้งานสำเร็จ!",
        });
        onClose();
      } else {
        showToastError({
          title: currentUser ? "ไม่สามารถอัปเดตผู้ใช้ได้!" : "การดำเนินการล้มเหลว!",
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

    return basicValidation;
  };

  const roles = [
    { value: "SUPERADMIN", label: "ผู้ดูแลระบบขั้นสูงสุด" },
    { value: "ADMIN", label: "ผู้บริหาร" },
    { value: "USER", label: "ผู้ใช้งาน" },
    { value: "OFFICER1", label: "เจ้าหน้าที่จ่ายเค้ก" },
    { value: "OFFICER2", label: "เจ้าหน้าที่จัดเค้ก" },
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
            {/* Status messages - แสดงใต้ input field */}
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
              type={showPassword ? "text" : "password"} // Dynamic type
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
              className="absolute right-3 top-1/2 p-1 hover:bg-muted rounded-full transition-colors flex justify-center items-center"
              aria-label={showPassword ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4 text-muted-foreground " />
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

          {/* Role selection */}
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
              className="min-w-[120px]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  กำลังบันทึก...
                </>
              ) : currentUser ? (
                "บันทึกการเปลี่ยนแปลง"
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
