import React, { useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { useNotFound } from "../contexts/NotFoundContext"; // Import useNotFound

const NotFound: React.FC = () => {
  const { setNotFoundActive } = useNotFound();

  useEffect(() => {
    setNotFoundActive(true);
    return () => setNotFoundActive(false);
  }, [setNotFoundActive]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground">
      <h1 className="text-6xl font-bold bg-gradient-to-r from-blue-500 to-blue-300 bg-clip-text text-transparent">404</h1>
      <h2 className="text-2xl font-semibold mb-4">ไม่พบหน้าที่ต้องการ</h2>
      <p className="text-lg text-muted-foreground mb-4">
        หน้าที่คุณกำลังมองหาไม่มีอยู่โปรดตรวจสอบอีกครั้ง
      </p>
      <Link to="/">
        <button className="px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-300 rounded-md shadow-md hover:scale-105 transition-all text-white cursor-pointer">
          กลับหน้าแรก
        </button>
      </Link>
    </div>
  );
};

export default NotFound;
