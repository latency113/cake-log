import { useNavigate } from "@tanstack/react-router";
import React, { useState } from "react";
import InputField from "../components/common/InputField";
import { useAuth } from "../contexts/AuthContext";
import { showAlertSuccess, showAlertError } from "../utils/alerts";
import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";

const Login: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { user } = await login(username, password);

      const userRole = user.role.toLowerCase();
      console.log("User role:", userRole);

      showAlertSuccess({
        title: "เข้าสู่ระบบสำเร็จ!",
        text: `ยินดีต้อนรับ, ${user.firstname} ${user.lastname}`,
        showConfirmButton: false,
        timer: 1500,
      });

      if (userRole === "superadmin") {
        navigate({ to: "/dashboard" });
      } else if (userRole === "admin") {
        navigate({ to: "/executive-summary" });
      } else if (userRole === "officer1") {
        navigate({ to: "/officer-orders" });
      } else if (userRole === "officer2") {
        navigate({ to: "/officer-prepare" });
      } else if (userRole === "user") {
        navigate({ to: "/home", search: {} as any });
      }
    } catch (error) {
      console.error("Login error:", error);
      showAlertError({
        title: "เข้าสู่ระบบไม่สำเร็จ",
        text: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      className="min-h-screen flex"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 flex-1">
        {/* Left Panel - Welcome Section (Hidden on mobile, shown on large screens) */}
        <div className="hidden lg:flex flex-1 bg-gradient-to-br from-purple-500 via-purple-400 to-pink-400 relative overflow-hidden items-center justify-center p-8 xl:p-12">
          {/* Animated Decorative Elements */}
          <div className="absolute inset-0 overflow-hidden">
            {/* Diagonal stripes */}
            <div className="absolute top-32 -left-8 w-64 h-12 bg-gradient-to-r from-orange-400 to-pink-400 rounded-full transform -rotate-45 opacity-60"></div>
            <div className="absolute top-48 left-12 w-48 h-8 bg-gradient-to-r from-yellow-300 to-orange-400 rounded-full transform -rotate-45 opacity-50"></div>
            <div className="absolute top-24 left-32 w-32 h-6 bg-gradient-to-r from-pink-300 to-orange-300 rounded-full transform -rotate-45 opacity-40"></div>

            <div className="absolute bottom-32 left-16 w-56 h-10 bg-gradient-to-r from-orange-400 to-pink-400 rounded-full transform -rotate-45 opacity-60"></div>
            <div className="absolute bottom-48 left-8 w-40 h-8 bg-gradient-to-r from-yellow-300 to-orange-400 rounded-full transform -rotate-45 opacity-50"></div>

            {/* Circular elements */}
            <div className="absolute bottom-24 right-32 w-32 h-32 bg-gradient-to-br from-orange-400 to-yellow-400 rounded-full opacity-70"></div>
            <div className="absolute bottom-36 right-16 w-48 h-48 bg-gradient-to-br from-orange-300 to-pink-300 rounded-full opacity-50"></div>
          </div>

          {/* Welcome Content */}
          <div className="relative z-10 text-white max-w-lg">
            {/* ส่วน Heading: ใช้ชื่อโครงการ */}
            <h1 className="text-4xl xl:text-5xl 2xl:text-6xl font-bold mb-6 truncate">
              ระบบ Cake Log
            </h1>

            {/* ส่วน Paragraph เสริม: ใช้ 'จุดมุ่งหมายหลัก' */}
            <p className="text-base xl:text-md leading-relaxed opacity-70">
              ระบบนี้จะช่วยเปลี่ยนกระบวนการรับออเดอร์แบบ Manual
              ไปสู่ระบบดิจิทัลที่รวดเร็วและแม่นยำยิ่งขึ้น
              เพื่อให้นักศึกษาและคณะกรรมการสามารถมุ่งเน้นไปที่คุณภาพของผลิตภัณฑ์และการแข่งขันได้เต็มที่
            </p>
          </div>
        </div>

        {/* Right Panel - Login Form */}
        <div className="w-full bg-gradient-to-br from-gray-50 to-purple-50 flex dark:from-gray-900 dark:via-background dark:to-gray-800 items-center justify-center p-4 sm:p-6 lg:p-8">
          <div className="relative bg-card p-6 sm:p-8 rounded-md shadow-lg w-full max-w-md border border-border">
            {/* Mobile Header with Gradient */}
            <div className="lg:hidden mb-6 -mx-6 -mt-6 sm:-mx-8 sm:-mt-8 p-6 sm:p-8 bg-gradient-to-br from-purple-500 via-purple-400 to-pink-400 rounded-t-md">
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                Welcome to Cake Log
              </h1>
              <p className="text-white text-sm opacity-90">
                เข้าสู่ระบบเพื่อเริ่มต้นใช้งาน
              </p>
            </div>

            {/* Header */}
            <div className="text-center mb-6 sm:mb-8">
              <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-purple-500 via-purple-400 to-pink-400 rounded-full mb-3 sm:mb-4 shadow-lg">
                <svg
                  className="w-7 h-7 sm:w-8 sm:h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
                เข้าสู่ระบบ
              </h2>
              <p className="text-gray-500 text-xs sm:text-sm">
                กรุณาใส่ข้อมูลเพื่อเข้าสู่ระบบ
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
              <div className="space-y-3 sm:space-y-4">
                <InputField
                  label="ชื่อผู้ใช้"
                  name="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="ป้อนชื่อผู้ใช้"
                  type="text"
                />
                <div className="relative">
                  <InputField
                    label="รหัสผ่าน"
                    name="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="ป้อนรหัสผ่าน"
                    type={showPassword ? "text" : "password"} // Dynamic type
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
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-purple-500 via-purple-400 to-pink-400 text-white py-2.5 sm:py-3 px-4 rounded-sm font-medium text-sm sm:text-base
                     hover:from-purple-700 hover:via-purple-600 hover:to-pink-600 
                     focus:outline-none focus:ring-4 focus:ring-blue-300 
                     transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]
                     disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
                     shadow-lg hover:shadow-xl"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    กำลังเข้าสู่ระบบ...
                  </span>
                ) : (
                  "เข้าสู่ระบบ"
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Login;
