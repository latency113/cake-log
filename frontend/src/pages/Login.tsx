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

  const titleText = "Cake Log System";
  const descText = "เปลี่ยนการรับออเดอร์แบบเดิม สู่ระบบดิจิทัลที่รวดเร็ว แม่นยำ และใช้งานง่าย";

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
    <div className="min-h-screen flex bg-white overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-2 flex-1">
        {/* Left Panel - System Brand Section */}
        <div className="hidden lg:flex flex-1 bg-blue-600 relative overflow-hidden items-center justify-center p-12">
          {/* Sharp Patterns */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-0 right-0 w-full h-full opacity-10">
              <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[120%] border-r border-white transform rotate-12"></div>
              <div className="absolute top-[20%] right-[10%] w-[40%] h-[80%] border-r border-white transform rotate-12"></div>
            </div>
            {/* System Blue Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-700 via-transparent to-blue-500 opacity-60"></div>
          </div>

          <motion.div 
            className="relative z-10 text-white max-w-md"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
          >
            <div className="mb-8">
              <div className="flex items-center gap-5 mb-8">
                <img
                  src="https://nc.ac.th/img/logo.png"
                  alt="logo"
                  className="w-20 h-20 object-contain"
                />
                <motion.h1 
                  className="text-3xl font-semibold"
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
              className="text-lg leading-relaxed text-blue-50/90 font-normal border-l-2 border-white/20 pl-6"
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

        {/* Right Panel - Minimalist Thai Login Form */}
        <div className="w-full flex items-center justify-center p-6 sm:p-16 bg-slate-50/50">
          <motion.div 
            className="w-full max-w-sm"
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 120, damping: 20, delay: 0.2 }}
          >
            {/* Branding for Mobile */}
            <div className="lg:hidden mb-12 flex items-center gap-4">
              <img src="https://nc.ac.th/img/logo.png" alt="logo" className="w-12 h-12" />
              <h1 className="text-2xl font-semibold text-blue-600 tracking-tight">Cake Log System</h1>
            </div>

            <div className="mb-10">
              <h2 className="text-3xl font-semibold text-slate-800 mb-2 tracking-tight">
                เข้าสู่ระบบ
              </h2>
              <p className="text-slate-500 text-sm font-normal">
                กรุณาระบุชื่อผู้ใช้และรหัสผ่านเพื่อเข้าใช้งาน
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 ml-0.5">
                    ชื่อผู้ใช้
                  </label>
                  <InputField
                    name="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Username"
                    type="text"
                    className="mb-0"
                    inputClassName="w-full h-12 px-4 rounded-sm border border-slate-200 bg-white focus:border-blue-500 focus:ring-0 transition-all duration-200 text-sm font-normal shadow-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 ml-0.5">
                    รหัสผ่าน
                  </label>
                  <div className="relative">
                    <InputField
                      name="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Password"
                      type={showPassword ? "text" : "password"}
                      className="mb-0"
                      inputClassName="w-full h-12 px-4 rounded-sm border border-slate-200 bg-white focus:border-blue-500 focus:ring-0 transition-all duration-200 text-sm font-normal shadow-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2 hover:text-blue-600 transition-colors text-slate-300"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-blue-600 text-white h-12 rounded-sm font-medium text-base
                       hover:bg-blue-700 active:bg-blue-800 transition-all duration-200
                       disabled:opacity-50 disabled:cursor-not-allowed
                       flex items-center justify-center gap-2 shadow-md shadow-blue-600/10"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                      กำลังประมวลผล...
                    </span>
                  ) : (
                    "เข้าสู่ระบบ"
                  )}
                </button>
              </div>
            </form>

            <div className="mt-16 pt-8 border-t border-slate-100 flex justify-between items-center text-[10px] uppercase tracking-widest text-slate-300 font-medium">
              <span>© {new Date().getFullYear()} Cake Log System</span>
              <span>NVC Digital</span>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Login;
