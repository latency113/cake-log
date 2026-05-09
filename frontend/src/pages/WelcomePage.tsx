import { Link } from "@tanstack/react-router";
import { Button } from "../components/ui/button";
import bgImage from "../../public/assets/bg.jpg";
import { LogIn } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";

function WelcomePage() {
  const [isSkipped, setIsSkipped] = useState(false);
  const titleText = "ระบบรายงานการสั่งจองเค้ก";
  const subTitleText = "Cake Log Management System";

  const handleSkip = () => {
    if (!isSkipped) setIsSkipped(true);
  };

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
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.1,
      },
    },
  };

  return (
    <div
      className="relative flex flex-col items-center justify-center min-h-screen bg-cover bg-center overflow-hidden cursor-pointer"
      style={{ backgroundImage: `url(${bgImage})` }}
      onClick={handleSkip}
    >
      {/* Professional Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/80 via-blue-800/60 to-transparent"></div>
      
      {/* Decorative Lines */}
      <div className="absolute inset-0 overflow-hidden opacity-20 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-px h-full bg-white/20 transform -rotate-12"></div>
        <div className="absolute top-0 left-2/4 w-px h-full bg-white/20 transform -rotate-12"></div>
        <div className="absolute top-0 left-3/4 w-px h-full bg-white/20 transform -rotate-12"></div>
      </div>

      <motion.div 
        key={isSkipped ? "skipped" : "animated"}
        className="relative z-10 text-center px-4 max-w-4xl"
        initial={isSkipped ? false : { scale: 0.9, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={isSkipped ? { duration: 0 } : { type: "spring", stiffness: 100, damping: 20 }}
      >
        <div className="flex flex-col items-center mb-10">
          <img
            src="https://nc.ac.th/img/logo.png"
            alt="logo"
            className="w-28 h-28 object-contain mb-8 drop-shadow-2xl"
          />
          
          <motion.h1 
            className="text-4xl md:text-5xl lg:text-6xl font-semibold text-white mb-4 tracking-tight"
            variants={isSkipped ? {} : typewriterVariants}
            initial="hidden"
            animate="visible"
          >
            {isSkipped ? titleText : titleText.split("").map((char, index) => (
              <motion.span key={index} variants={characterVariants}>
                {char}
              </motion.span>
            ))}
          </motion.h1>
          
          <motion.p 
            className="text-xl md:text-2xl font-medium text-blue-200/90 tracking-widest uppercase mb-8"
            initial={isSkipped ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={isSkipped ? { duration: 0 } : { delay: 1.5, duration: 1 }}
          >
            {subTitleText}
          </motion.p>
          
          <div className="w-20 h-1 bg-sky-400 rounded-full mb-10 opacity-60"></div>

          <p className="text-lg text-blue-50/70 font-normal max-w-2xl mb-12 leading-relaxed">
            ก้าวสู่ระบบการจัดการออเดอร์รูปแบบใหม่ที่มีความแม่นยำและรวดเร็ว 
            ออกแบบมาเพื่อรองรับการทำงานระดับมืออาชีพอย่างเต็มรูปแบบ
          </p>
        </div>

        <motion.div 
          className="flex justify-center"
          initial={isSkipped ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={isSkipped ? { duration: 0 } : { delay: 2, duration: 0.5 }}
        >
          <Link to="/login">
            <Button className="px-10 py-7 text-lg gap-3 bg-blue-600 hover:bg-blue-700 text-white rounded-sm border border-blue-400/30 transition-all duration-300 shadow-xl shadow-blue-900/40">
              <LogIn className="w-5 h-5" />
              <span className="font-medium">หน้าเข้าสู่ระบบ</span>
            </Button>
          </Link>
        </motion.div>
      </motion.div>

      {/* Footer info */}
      <div className="absolute bottom-10 left-0 right-0 z-10 text-center">
        <p className="text-[11px] uppercase tracking-[0.4em] text-white/30 font-medium">
          Professional Digital Solutions &copy; {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}

export default WelcomePage;
