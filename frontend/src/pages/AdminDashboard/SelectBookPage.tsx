import React, { useState, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { getOrderBooks, updateOrderBook } from "@/utils/api/orderBooks";
import { Book, CheckCircle, Lock, Users, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import type { OrderBook } from "@/types/orderBook";
import { useAuth } from "@/contexts/AuthContext";
import { showToastError, showToastSuccess } from "@/utils/alerts";

const SelectBookPage: React.FC = () => {
  const [orderBooks, setOrderBooks] = useState<OrderBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);
  const [targetRoomId, setTargetRoomId] = useState<string>("");
  const [filter, setFilter] = useState<"all" | "mine">("all");
  const [searchTerm, setSearchTerm] = useState("");

  const navigate = useNavigate();
  const { user, checkAuth } = useAuth();

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const response = await getOrderBooks(1, 999);
      setOrderBooks(response.data);
    } catch (error) {
      console.error("Failed to fetch order books:", error);
      showToastError({
        title: "เกิดข้อผิดพลาด",
        text: "ไม่สามารถโหลดข้อมูลสมุดจองได้",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchBooks();
  }, [user]);

  const myRooms = user?.teacher?.classroom || [];
  const assignedRoomIds = new Set(
    orderBooks.map((b) => b.classroom_id).filter(Boolean) as string[]
  );
  const unassignedRooms = myRooms.filter((r) => !assignedRoomIds.has(r.id));

  // Determine which books are mine
  const myAssignedBooks = orderBooks.filter((book) => 
    book.classroom_id && myRooms.some((r) => r.id === book.classroom_id)
  );

  const displayedBooks = filter === "mine" ? myAssignedBooks : orderBooks;

  const filteredBooks = displayedBooks.filter((book) => {
    const searchLower = searchTerm.toLowerCase();
    const bookNumMatch = book.bookNumber.toLowerCase().includes(searchLower);
    const roomNameMatch = book.classroom?.name.toLowerCase().includes(searchLower);
    const deptMatch = book.classroom?.department?.name.toLowerCase().includes(searchLower);
    const gradeMatch = (book.classroom?.grade_level?.level === "VOCATIONAL" ? "ปวช" : "ปวส").includes(searchLower) ||
                       (book.classroom?.grade_level?.year?.toString() || "").includes(searchLower);
    
    return bookNumMatch || roomNameMatch || deptMatch || gradeMatch;
  });

  const handleBookClick = (bookId: string) => {
    if (!user) return;

    if (unassignedRooms.length === 0) {
      showToastError({
        title: "ไม่สามารถเลือกได้",
        text: "ห้องทั้งหมดที่คุณรับผิดชอบมีสมุดจองครบแล้ว",
      });
      return;
    }

    // Always open modal to let user confirm, even if only 1 room
    setSelectedBookId(bookId);
    if (unassignedRooms.length === 1) {
      setTargetRoomId(unassignedRooms[0].id);
    } else {
      setTargetRoomId("");
    }
    setIsRoomModalOpen(true);
  };

  const confirmAssignment = async (bookId: string, classroomId: string) => {
    if (!user) return;
    try {
      await updateOrderBook(bookId, {
        classroom_id: classroomId,
      } as any);

      showToastSuccess({ title: "สำเร็จ", text: "เลือกสมุดจองเรียบร้อยแล้ว" });
      await Promise.all([checkAuth(), fetchBooks()]);
      setIsRoomModalOpen(false);
      navigate({ to: "/home", search: { bookId } as any });
    } catch (error) {
      console.error("Failed to assign order book:", error);
      showToastError({
        title: "เกิดข้อผิดพลาด",
        text: "ไม่สามารถเลือกสมุดจองนี้ได้",
      });
    }
  };

  const handleContinueWithBook = (bookId: string) => {
    navigate({ to: "/home", search: { bookId } as any });
  };

  if (loading) {
    return <div className="p-8 text-center">กำลังโหลดข้อมูล...</div>;
  }

  return (
    <div className="container mx-auto p-8 max-w-7xl">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">เลือกเล่มใบสั่งจอง</h1>
        <p className="text-muted-foreground mb-6">
          เล่มสมุดใบสั่งจองแต่ละห้อง (1 เล่มต่อ 1 ห้อง)
        </p>

        <div className="flex flex-col md:flex-row justify-center items-center gap-4">
          <div className="flex space-x-2">
            <Button 
              variant={filter === "all" ? "default" : "outline"} 
              onClick={() => setFilter("all")}
              className="rounded-full"
            >
              สมุดจองทั้งหมด
            </Button>
            <Button 
              variant={filter === "mine" ? "default" : "outline"} 
              onClick={() => setFilter("mine")}
              className="rounded-full flex items-center"
            >
              <Book className="w-4 h-4 mr-2" />
              เล่มของคุณ ({myAssignedBooks.length})
            </Button>
          </div>
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="ค้นหาเลขเล่ม หรือ ห้อง..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 rounded-full bg-white"
            />
          </div>
        </div>
      </div>

      {filteredBooks.length === 0 ? (
        <div className="p-12 text-center border-2 border-dashed rounded-xld bg-gray-50/50">
          <Book className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
          <p className="text-muted-foreground">ไม่พบสมุดจองที่ตรงตามเงื่อนไขการค้นหา</p>
          {searchTerm && (
            <Button variant="link" onClick={() => setSearchTerm("")} className="mt-2 text-blue-600">
              ล้างการค้นหา
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredBooks.map((book) => {
            const isFull = book.currentNumber >= book.maxCapacity;
            const isClosed = book.isClosed;
            const isTaken = !!book.classroom_id;
            const isOwnedByMe = isTaken && myRooms.some((r) => r.id === book.classroom_id);
            const isOwnedByOthers = isTaken && !isOwnedByMe;

            // A book is selectable only if it's not taken and the user has rooms left to assign
            const canUserPickMore = unassignedRooms.length > 0;
            const availableForSelection = !isTaken && !isClosed && !isFull && canUserPickMore;

            const roomName = book.classroom ? (
              book.classroom.grade_level 
                ? `${book.classroom.grade_level.level === "VOCATIONAL" ? "ปวช." : "ปวส."} ${book.classroom.grade_level.year} ห้อง ${book.classroom.name} แผนก ${book.classroom.department?.name || ""}`
                : `ห้อง ${book.classroom.name}`
            ) : "ไม่ได้ระบุห้อง";

            return (
              <Card
                key={book.id}
                className={`relative overflow-hidden transition-all hover:shadow-lg flex flex-col h-full ${
                  isTaken && !isOwnedByMe
                    ? "opacity-70 bg-gray-50"
                    : "border-blue-200 bg-white shadow-sm"
                }`}
              >
                {isOwnedByMe && (
                  <div className="absolute top-0 right-0 bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded-bl-lg font-bold z-10">
                    เล่มของคุณ
                  </div>
                )}
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div
                      className={`p-2 rounded-lg ${
                        isOwnedByMe
                          ? "bg-blue-600 text-white"
                          : "bg-blue-100 text-blue-600"
                      }`}
                    >
                      <Book className="w-6 h-6" />
                    </div>
                    {isClosed ? (
                      <div className="flex items-center text-red-500 text-sm font-medium bg-red-50 px-2 py-1 rounded">
                        <Lock className="w-3 h-3 mr-1" /> ปิดเล่ม
                      </div>
                    ) : isOwnedByMe ? (
                      <div className="flex items-center text-blue-600 text-sm font-medium bg-blue-50 px-2 py-1 rounded">
                        <CheckCircle className="w-3 h-3 mr-1" /> กำลังใช้งาน
                      </div>
                    ) : isOwnedByOthers ? (
                      <div className="flex items-center text-gray-500 text-sm font-medium bg-gray-100 px-2 py-1 rounded">
                        <Lock className="w-3 h-3 mr-1" /> ไม่ว่าง ({book.classroom?.name})
                      </div>
                    ) : isFull ? (
                      <div className="flex items-center text-orange-500 text-sm font-medium bg-orange-50 px-2 py-1 rounded">
                        เต็มแล้ว
                      </div>
                    ) : (
                      <div className="flex items-center text-green-600 text-sm font-medium bg-green-50 px-2 py-1 rounded">
                        <CheckCircle className="w-3 h-3 mr-1" /> ว่าง
                      </div>
                    )}
                  </div>
                  <CardTitle className="mt-4 text-xl">
                    เล่มที่ {book.bookNumber}
                  </CardTitle>
                  <CardDescription className="flex flex-col">
                    {isTaken && (
                      <span className="font-bold text-blue-600 text-sm mb-1">{roomName}</span>
                    )}
                    <span>เลขที่ {book.startNumber} - {book.endNumber}</span>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">ใช้ไปแล้ว:</span>
                      <span className="font-medium">
                        {book.currentNumber} / {book.maxCapacity}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className={`h-2.5 rounded-full ${
                          isFull
                            ? "bg-red-500"
                            : isOwnedByMe
                            ? "bg-blue-600"
                            : "bg-green-500"
                        }`}
                        style={{
                          width: `${
                            (book.currentNumber / book.maxCapacity) * 100
                          }%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="mt-auto">
                  {isOwnedByMe && !isClosed ? (
                    <Button
                      className="w-full bg-blue-600 hover:bg-blue-700 font-bold"
                      onClick={() => handleContinueWithBook(book.id)}
                    >
                      ใช้งานเล่มนี้ต่อ
                    </Button>
                  ) : (
                    <Button
                      className="w-full"
                      disabled={!availableForSelection}
                      onClick={() => handleBookClick(book.id)}
                      variant={availableForSelection ? "default" : "secondary"}
                    >
                      {!isTaken ? "เลือกเล่มนี้" : "ไม่ว่าง"}
                    </Button>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}

      {/* Room Selection Modal */}
      <Dialog open={isRoomModalOpen} onOpenChange={setIsRoomModalOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Users className="w-5 h-5 mr-2 text-blue-600" />
              เลือกห้องที่จะใช้เล่มนี้
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground mb-4">
              กรุณาระบุห้องที่ยังไม่มีสมุดจอง เพื่อใช้กับเล่มที่เลือก
            </p>
            <Select onValueChange={setTargetRoomId} value={targetRoomId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="เลือกห้อง" />
              </SelectTrigger>
              <SelectContent>
                {unassignedRooms.map((room) => (
                  <SelectItem key={room.id} value={room.id}>
                    ระดับชั้น{" "}
                    {room.grade_level?.level === "VOCATIONAL" ? "ปวช." : "ปวส."}{" "}
                    {room.grade_level?.year} ห้อง {room.name} แผนก (
                    {room.department?.name})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRoomModalOpen(false)}>
              ยกเลิก
            </Button>
            <Button
              disabled={!targetRoomId}
              onClick={() => confirmAssignment(selectedBookId!, targetRoomId)}
            >
              ยืนยันการเลือก
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
export default SelectBookPage;