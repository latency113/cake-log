import { ProductRepository } from "@/features/repository/Product/Product.repository"
import { CreateProductDto, ProductSchema, UpdateProductDto } from "./Product.schema";
import { getPaginationParams } from "@/shared/utils/pagination";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

export namespace ProductService {
  export async function create(
    product: CreateProductDto
  ) {
    if (!product.name || product.name.trim() === '') {
      throw new Error('Product name is required and cannot be empty.');
    }
    if (product.price < 0) {
      throw new Error('Product price cannot be negative.');
    }
    try {
      const newProduct = await ProductRepository.create(product);
      return newProduct;
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        throw new Error("Product name already exists");
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
    const products = await ProductRepository.findAll({
      skip,
      take,
      search,
      orderBy: { price: 'asc' },
    });
    const total = await ProductRepository.countAll(search);

    const totalPages = Math.ceil(total / itemsPerPage);
    const nextPage = page < totalPages;
    const previousPage = page > 1;

    return {
      data: products,
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

  export async function findById(productId: string) {
    const product = await ProductRepository.findById(productId);
    if (!product) {
      throw new Error("Product not found");
    }
    return product;
  }

  export async function update(
    productId: string,
    data: UpdateProductDto
  ) {
    if (data.price !== undefined && data.price < 0) {
      throw new Error('Product price cannot be negative.');
    }
    try {
      return await ProductRepository.update(productId, data);
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === "P2025") {
          throw new Error("Product not found");
        }
        if (error.code === "P2002") {
          throw new Error("Product name already exists");
        }
      }
      throw error;
    }
  }

  export async function remove(productId: string) {
    try {
      return await ProductRepository.remove(productId);
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === "P2025"
      ) {
        throw new Error("Product not found");
      }
      throw error;
    }
  }
}
