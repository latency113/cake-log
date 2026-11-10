import { describe, it, expect, beforeEach, spyOn } from "bun:test";
import { OrderBookService } from "./OrderBook.service";
import { OrderBookRepository } from "@/features/repository/OrderBook/OrderBook.repository";
import { ClassroomRepository } from "@/features/repository/Classroom/Classroom.repository";

describe("OrderBookService - Finalize & Unassign/Open/Close Rules", () => {
  beforeEach(() => {
    // Reset mocks before each test
  });

  describe("เมื่อสรุปยอดเค้กไปแล้ว (isOrderFinalized = true) การเปิด-ปิดต้องไม่เป็นผล", () => {
    it("ไม่สามารถปิดเล่มได้ถ้าห้องเรียนสรุปยอดเค้กแล้ว (คงสถานะ isClosed = false เดิม)", async () => {
      const mockFinalizedBook: any = {
        id: "book-1",
        bookNumber: "001",
        isClosed: false,
        classroom_id: "room-1",
        classroom: {
          id: "room-1",
          name: "1/1",
          isOrderFinalized: true, // สรุปยอดเค้กแล้ว
        },
      };

      const findByIdSpy = spyOn(OrderBookRepository, "findById").mockResolvedValue(mockFinalizedBook);
      const updateSpy = spyOn(OrderBookRepository, "update").mockResolvedValue(mockFinalizedBook);

      // เรียก update โดยพยายามเปลี่ยนสถานะเป็น isClosed: true
      const result = await OrderBookService.update("book-1", { isClosed: true });

      // ผลลัพธ์: isClosed ต้องยังคงเป็น false เดิม (ไม่เป็นผล)
      expect(result.isClosed).toBe(false);
      // update ของ repository ต้องไม่ถูกเรียกด้วย isClosed: true
      expect(updateSpy).not.toHaveBeenCalled();

      findByIdSpy.mockRestore();
      updateSpy.mockRestore();
    });

    it("ไม่สามารถเปิดเล่มได้ถ้าห้องเรียนสรุปยอดเค้กแล้ว (คงสถานะ isClosed = true เดิม)", async () => {
      const mockFinalizedClosedBook: any = {
        id: "book-2",
        bookNumber: "002",
        isClosed: true,
        classroom_id: "room-2",
        classroom: {
          id: "room-2",
          name: "1/2",
          isOrderFinalized: true, // สรุปยอดเค้กแล้ว
        },
      };

      const findByIdSpy = spyOn(OrderBookRepository, "findById").mockResolvedValue(mockFinalizedClosedBook);
      const updateSpy = spyOn(OrderBookRepository, "update").mockResolvedValue(mockFinalizedClosedBook);

      // เรียก update โดยพยายามเปิดเล่ม isClosed: false
      const result = await OrderBookService.update("book-2", { isClosed: false });

      // ผลลัพธ์: isClosed ต้องยังคงเป็น true เดิม (ไม่เป็นผล)
      expect(result.isClosed).toBe(true);
      expect(updateSpy).not.toHaveBeenCalled();

      findByIdSpy.mockRestore();
      updateSpy.mockRestore();
    });

    it("อัปเดตฟิลด์อื่นได้ แต่ isClosed จะถูกตัดทิ้งไม่ให้มีผลเมื่อสรุปยอดแล้ว", async () => {
      const mockFinalizedBook: any = {
        id: "book-3",
        bookNumber: "003",
        maxCapacity: 50,
        isClosed: false,
        classroom_id: "room-3",
        classroom: {
          id: "room-3",
          name: "1/3",
          isOrderFinalized: true, // สรุปยอดเค้กแล้ว
        },
      };

      const findByIdSpy = spyOn(OrderBookRepository, "findById").mockResolvedValue(mockFinalizedBook);
      const updateSpy = spyOn(OrderBookRepository, "update").mockImplementation(async (id, data) => {
        return {
          ...mockFinalizedBook,
          ...data,
        };
      });

      // ส่งทั้ง maxCapacity: 60 และ isClosed: true
      const result = await OrderBookService.update("book-3", {
        maxCapacity: 60,
        isClosed: true,
      });

      // maxCapacity อัปเดตได้สำเร็จ
      expect(result.maxCapacity).toBe(60);
      // แต่ isClosed ต้องไม่เปลี่ยน (ไม่เป็นผล)
      expect(result.isClosed).toBe(false);
      // ตรวจสอบ arguments ที่ส่งเข้า repository ต้องไม่มี isClosed
      expect(updateSpy).toHaveBeenCalledWith("book-3", { maxCapacity: 60 });

      findByIdSpy.mockRestore();
      updateSpy.mockRestore();
    });
  });

  describe("เมื่อสรุปยอดเค้กไปแล้ว (isOrderFinalized = true) การยกเลิก/เปลี่ยนเจ้าของ หรือลบเล่ม", () => {
    it("ไม่สามารถยกเลิกเจ้าของ (classroom_id: null) ได้ถ้าสรุปยอดแล้ว", async () => {
      const mockFinalizedBook: any = {
        id: "book-finalized-1",
        bookNumber: "010",
        classroom_id: "room-10",
        classroom: {
          id: "room-10",
          name: "1/10",
          isOrderFinalized: true, // สรุปยอดแล้ว
        },
      };

      const findByIdSpy = spyOn(OrderBookRepository, "findById").mockResolvedValue(mockFinalizedBook);

      // พยายามส่ง classroom_id: null เพื่อยกเลิกเจ้าของ
      expect(
        OrderBookService.update("book-finalized-1", { classroom_id: null as any })
      ).rejects.toThrow("Cannot unassign or change owner of a finalized order book");

      findByIdSpy.mockRestore();
    });

    it("ไม่สามารถเปลี่ยนเจ้าของไปยังห้องอื่นได้ถ้าสรุปยอดแล้ว", async () => {
      const mockFinalizedBook: any = {
        id: "book-finalized-2",
        bookNumber: "011",
        classroom_id: "room-10",
        classroom: {
          id: "room-10",
          name: "1/10",
          isOrderFinalized: true, // สรุปยอดแล้ว
        },
      };

      const findByIdSpy = spyOn(OrderBookRepository, "findById").mockResolvedValue(mockFinalizedBook);

      // พยายามเปลี่ยนไปห้อง room-99
      expect(
        OrderBookService.update("book-finalized-2", { classroom_id: "room-99" })
      ).rejects.toThrow("Cannot unassign or change owner of a finalized order book");

      findByIdSpy.mockRestore();
    });

    it("ไม่สามารถลบเล่มได้ถ้าห้องเรียนสรุปยอดแล้ว", async () => {
      const mockFinalizedBook: any = {
        id: "book-finalized-3",
        bookNumber: "012",
        classroom_id: "room-10",
        classroom: {
          id: "room-10",
          name: "1/10",
          isOrderFinalized: true, // สรุปยอดแล้ว
        },
      };

      const findByIdSpy = spyOn(OrderBookRepository, "findById").mockResolvedValue(mockFinalizedBook);

      expect(
        OrderBookService.deleteById("book-finalized-3")
      ).rejects.toThrow("Cannot delete a finalized order book");

      findByIdSpy.mockRestore();
    });
  });

  describe("เมื่อยังไม่ได้สรุปยอดเค้ก (isOrderFinalized = false หรือไม่มีห้องเรียน)", () => {
    it("สามารถลบเล่มได้ปกติถ้ายังไม่สรุปยอด", async () => {
      const mockUnfinalizedBook: any = {
        id: "book-normal-del",
        bookNumber: "021",
        classroom_id: "room-20",
        classroom: {
          id: "room-20",
          name: "1/20",
          isOrderFinalized: false, // ยังไม่สรุปยอด
        },
      };

      const findByIdSpy = spyOn(OrderBookRepository, "findById").mockResolvedValue(mockUnfinalizedBook);
      const deleteSpy = spyOn(OrderBookRepository, "deleteById").mockResolvedValue(mockUnfinalizedBook);

      const result = await OrderBookService.deleteById("book-normal-del");

      expect(result.id).toBe("book-normal-del");
      expect(deleteSpy).toHaveBeenCalledWith("book-normal-del");

      findByIdSpy.mockRestore();
      deleteSpy.mockRestore();
    });
    it("สามารถยกเลิกเจ้าของได้ปกติถ้ายังไม่สรุปยอด", async () => {
      const mockUnfinalizedBook: any = {
        id: "book-normal-1",
        bookNumber: "020",
        classroom_id: "room-20",
        classroom: {
          id: "room-20",
          name: "1/20",
          isOrderFinalized: false, // ยังไม่สรุปยอด
        },
      };

      const findByIdSpy = spyOn(OrderBookRepository, "findById").mockResolvedValue(mockUnfinalizedBook);
      const updateSpy = spyOn(OrderBookRepository, "update").mockResolvedValue({
        ...mockUnfinalizedBook,
        classroom_id: null,
      });

      const result = await OrderBookService.update("book-normal-1", { classroom_id: null as any });

      expect(result.classroom_id).toBeNull();
      expect(updateSpy).toHaveBeenCalledWith("book-normal-1", { classroom_id: null });

      findByIdSpy.mockRestore();
      updateSpy.mockRestore();
    });

    it("สามารถปิดเล่มได้ปกติเมื่อห้องเรียนยังไม่ได้สรุปยอด", async () => {
      const mockUnfinalizedBook: any = {
        id: "book-4",
        bookNumber: "004",
        isClosed: false,
        classroom_id: "room-4",
        classroom: {
          id: "room-4",
          name: "1/4",
          isOrderFinalized: false, // ยังไม่สรุปยอด
        },
      };

      const findByIdSpy = spyOn(OrderBookRepository, "findById").mockResolvedValue(mockUnfinalizedBook);
      const updateSpy = spyOn(OrderBookRepository, "update").mockResolvedValue({
        ...mockUnfinalizedBook,
        isClosed: true,
      });

      const result = await OrderBookService.update("book-4", { isClosed: true });

      expect(result.isClosed).toBe(true);
      expect(updateSpy).toHaveBeenCalledWith("book-4", { isClosed: true });

      findByIdSpy.mockRestore();
      updateSpy.mockRestore();
    });

    it("สามารถเปิดเล่มได้ปกติเมื่อไม่มีห้องเรียนครอบครอง", async () => {
      const mockUnassignedBook: any = {
        id: "book-5",
        bookNumber: "005",
        isClosed: true,
        classroom_id: null,
        classroom: null,
      };

      const findByIdSpy = spyOn(OrderBookRepository, "findById").mockResolvedValue(mockUnassignedBook);
      const updateSpy = spyOn(OrderBookRepository, "update").mockResolvedValue({
        ...mockUnassignedBook,
        isClosed: false,
      });

      const result = await OrderBookService.update("book-5", { isClosed: false });

      expect(result.isClosed).toBe(false);
      expect(updateSpy).toHaveBeenCalledWith("book-5", { isClosed: false });

      findByIdSpy.mockRestore();
      updateSpy.mockRestore();
    });
  });

  describe("การเปิด-ปิดแบบกลุ่ม (bulkClose / bulkOpen)", () => {
    it("bulkClose ต้องเรียก repository เพื่อปิดเล่มแบบกลุ่ม", async () => {
      const bulkCloseSpy = spyOn(OrderBookRepository, "bulkClose").mockResolvedValue(5);

      const result = await OrderBookService.bulkClose(["book-1", "book-2"]);

      expect(result).toBe(5);
      expect(bulkCloseSpy).toHaveBeenCalledWith(["book-1", "book-2"], undefined);

      bulkCloseSpy.mockRestore();
    });

    it("bulkOpen ต้องเรียก repository เพื่อเปิดเล่มแบบกลุ่ม", async () => {
      const bulkOpenSpy = spyOn(OrderBookRepository, "bulkOpen").mockResolvedValue(3);

      const result = await OrderBookService.bulkOpen(undefined, true);

      expect(result).toBe(3);
      expect(bulkOpenSpy).toHaveBeenCalledWith(undefined, true);

      bulkOpenSpy.mockRestore();
    });
  });
});
