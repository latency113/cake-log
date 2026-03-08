import { OrderBookRepository } from "@/features/repository/OrderBook/OrderBook.repository";
import {
  CreateOrderBookDto,
  UpdateOrderBookDto,
} from "./OrderBook.schema";
import { getPaginationParams } from "@/shared/utils/pagination";
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
    const books = await OrderBookRepository.findAll({
      skip,
      take,
      search,
    });
    const total = await OrderBookRepository.countAll(search);

    const totalPages = Math.ceil(total / itemsPerPage);
    const nextPage = page < totalPages;
    const previousPage = page > 1;

    return {
      data: books,
      meta_data: {
        page,
        itemsPerPage,
        total,
        totalPages,
        nextPage,
        previousPage,
      },
    };
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
      return await OrderBookRepository.update(id, data);
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
}
