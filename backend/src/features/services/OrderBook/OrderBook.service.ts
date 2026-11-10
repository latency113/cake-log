import { OrderBookRepository } from "@/features/repository/OrderBook/OrderBook.repository";
import { ClassroomRepository } from "@/features/repository/Classroom/Classroom.repository";
import {
  CreateOrderBookDto,
  UpdateOrderBookDto,
} from "./OrderBook.schema";
import { getPaginationParams, buildPaginatedResponse } from "@/shared/utils/pagination";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

export namespace OrderBookService {
  export async function create(data: CreateOrderBookDto) {
    if (!data.bookNumber || data.bookNumber.trim() === "") {
      throw new Error("Book number is required.");
    }

    try {
      return await OrderBookRepository.create(data);
    } catch (error: any) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        throw new Error("Book number already exists");
      }
      throw error;
    }
  }

  export async function findAll(
    options: { page?: number; itemsPerPage?: number; search?: string } = {}
  ) {
    const page = options.page ?? 1;
    const itemsPerPage = options.itemsPerPage ?? 10;
    const search = options.search;

    const { skip, take } = getPaginationParams(page, itemsPerPage);
    const [books, total] = await Promise.all([
      OrderBookRepository.findAll({ skip, take, search }),
      OrderBookRepository.countAll(search),
    ]);

    return buildPaginatedResponse(books, total, page, itemsPerPage);
  }

  export async function findById(id: string) {
    const book = await OrderBookRepository.findById(id);
    if (!book) {
      throw new Error("OrderBook not found");
    }
    return book;
  }

  export async function findAvailableBook() {
    return await OrderBookRepository.findAvailableBook();
  }

  export async function update(id: string, data: UpdateOrderBookDto) {
    try {
      const { isOrderFinalized, ...orderBookData } = data;
      const currentBook = await OrderBookRepository.findById(id);
      if (!currentBook) {
        throw new Error("OrderBook not found");
      }

      // ตรวจสอบสถานะสรุปยอดปัจจุบันของห้องเรียน
      const isAlreadyFinalized = Boolean(currentBook.classroom?.isOrderFinalized);

      // ถ้าสรุปยอดเค้กแล้ว จะไม่สามารถยกเลิกเจ้าของหรือเปลี่ยนเจ้าของได้
      if (
        isAlreadyFinalized &&
        orderBookData.classroom_id !== undefined &&
        orderBookData.classroom_id !== currentBook.classroom_id
      ) {
        throw new Error("Cannot unassign or change owner of a finalized order book");
      }

      // ถ้าสรุปยอดเค้กไปแล้ว (isOrderFinalized = true) การเปิด-ปิดเล่ม (isClosed) ต้องไม่เป็นผล
      const willBeFinalized =
        isOrderFinalized !== undefined ? isOrderFinalized : isAlreadyFinalized;
      if (willBeFinalized && orderBookData.isClosed !== undefined) {
        delete orderBookData.isClosed;
      }

      const hasOtherFieldsToUpdate = Object.keys(orderBookData).length > 0;
      const updatedBook = hasOtherFieldsToUpdate
        ? await OrderBookRepository.update(id, orderBookData)
        : currentBook;

      const targetClassroomId =
        orderBookData.classroom_id !== undefined
          ? orderBookData.classroom_id
          : currentBook.classroom_id;

      if (isOrderFinalized !== undefined && targetClassroomId) {
        await ClassroomRepository.setFinalize(targetClassroomId, isOrderFinalized);
      }

      return updatedBook;
    } catch (error: any) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        throw new Error("Book number already exists");
      }
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === "P2025"
      ) {
        throw new Error("OrderBook not found");
      }
      throw error;
    }
  }

  export async function deleteById(id: string) {
    try {
      const currentBook = await OrderBookRepository.findById(id);
      if (!currentBook) {
        throw new Error("OrderBook not found");
      }
      if (currentBook.classroom?.isOrderFinalized) {
        throw new Error("Cannot delete a finalized order book");
      }
      return await OrderBookRepository.deleteById(id);
    } catch (error: any) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === "P2025"
      ) {
        throw new Error("OrderBook not found");
      }
      throw error;
    }
  }

  export async function bulkClose(ids?: string[], closeAllUnbooked?: boolean) {
    return await OrderBookRepository.bulkClose(ids, closeAllUnbooked);
  }

  export async function bulkOpen(ids?: string[], openAllUnbooked?: boolean) {
    return await OrderBookRepository.bulkOpen(ids, openAllUnbooked);
  }
}
