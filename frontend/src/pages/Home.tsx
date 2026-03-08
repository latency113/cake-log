import React, { useEffect } from "react";
import OrderForm from "../components/form/OrderForm";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const Home: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const search: any = useSearch({ from: "/home" });
  const targetBookId = search.bookId;

  const myRooms = user?.teacher?.classroom || [];
  const allBooks = myRooms.flatMap((r) => r.orderBooks || []);

  // Find book based on search param or default to first active
  const activeBook = targetBookId
    ? allBooks.find((b) => b.id === targetBookId)
    : allBooks.find((b) => !b.isClosed);

  useEffect(() => {
    if (user && user.role === "USER") {
      if (!activeBook) {
        navigate({ to: "/select-book" });
      }
    }
  }, [user, activeBook, navigate]);

  if (user?.role === "USER" && !activeBook) {
    return <div className="p-8 text-center">กำลังตรวจสอบข้อมูลสมุดจอง...</div>;
  }

  return (
    <>
      <div className="min-h-screen font-sans text-foreground">
        <div className="mb-4">
          <Button
            variant="outline"
            onClick={() => navigate({ to: "/select-book" })}
            className="flex items-center font-medium"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            ย้อนกลับ
          </Button>
        </div>
        <div className="flex-1 min-w-0">
          <OrderForm initialBookId={activeBook?.id} />
        </div>
      </div>
    </>
  );
};

export default Home;
