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
      <h1 className="text-6xl font-bold text-primary">404</h1>
      <h2 className="text-2xl font-semibold mb-4">ไม่พบหน้าที่ต้องการ</h2>
      <p className="text-lg text-muted-foreground mb-4">
        หน้าที่คุณกำลังมองหาไม่มีอยู่โปรดตรวจสอบอีกครั้ง
      </p>
      <Link to="/">
        <button className="px-6 py-2 bg-primary text-primary-foreground rounded-lg shadow-md hover:bg-primary/90 transition-colors">
          กลับหน้าแรก
        </button>
      </Link>
    </div>
  );
};

export default NotFound;
