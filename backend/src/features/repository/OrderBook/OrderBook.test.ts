import { describe, it, expect, spyOn } from "bun:test";
import { OrderBookRepository } from "./OrderBook.repository";
import * as connectionManager from "@/providers/database/connection-manager";

describe("OrderBookRepository - Finalize & Bulk Open/Close Rules", () => {
  it("bulkClose ต้องกรองไม่ให้กระทบเล่มที่ห้องเรียนสรุปยอดเค้กแล้ว (isOrderFinalized = true)", async () => {
    let capturedWhere: any = null;
    const mockClient = {
      orderBook: {
        updateMany: async (args: any) => {
          capturedWhere = args.where;
          return { count: 4 };
        },
      },
    } as any;

    const getClientSpy = spyOn(connectionManager, "getClient").mockReturnValue(mockClient);

    const count = await OrderBookRepository.bulkClose(["book-1", "book-2"]);

    expect(count).toBe(4);
    expect(capturedWhere).toBeDefined();
    expect(capturedWhere.isClosed).toBe(false);
    expect(capturedWhere.currentNumber).toBe(0);
    expect(capturedWhere.orders).toEqual({ none: {} });
    expect(capturedWhere.id).toEqual({ in: ["book-1", "book-2"] });

    // ต้องมีเงื่อนไขกรองห้องเรียนที่ยังไม่สรุปยอด หรือยังไม่มีห้องเรียน
    expect(capturedWhere.OR).toEqual([
      { classroom_id: null },
      { classroom: { isOrderFinalized: false } },
    ]);

    getClientSpy.mockRestore();
  });

  it("bulkOpen ต้องกรองไม่ให้กระทบเล่มที่ห้องเรียนสรุปยอดเค้กแล้ว (isOrderFinalized = true)", async () => {
    let capturedWhere: any = null;
    const mockClient = {
      orderBook: {
        updateMany: async (args: any) => {
          capturedWhere = args.where;
          return { count: 2 };
        },
      },
    } as any;

    const getClientSpy = spyOn(connectionManager, "getClient").mockReturnValue(mockClient);

    const count = await OrderBookRepository.bulkOpen(undefined, true);

    expect(count).toBe(2);
    expect(capturedWhere).toBeDefined();
    expect(capturedWhere.isClosed).toBe(true);
    expect(capturedWhere.currentNumber).toBe(0);
    expect(capturedWhere.orders).toEqual({ none: {} });

    // ต้องมีเงื่อนไขกรองห้องเรียนที่ยังไม่สรุปยอด หรือยังไม่มีห้องเรียน
    expect(capturedWhere.OR).toEqual([
      { classroom_id: null },
      { classroom: { isOrderFinalized: false } },
    ]);

    getClientSpy.mockRestore();
  });
});
