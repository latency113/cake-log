import prisma from "@/providers/database/database.provider";
import { CreateProductDto, UpdateProductDto,  } from "@/features/services/Product/Product.schema";

export namespace ProductRepository {
  export async function create(
    product: CreateProductDto
  ) {
    return prisma.product.create({
      data: {
        ...product,
      },
    });
  }

  export async function findAll(options: {
    skip: number;
    take: number;
    search?: string;
    orderBy?: any;
  }) {
    const where = options.search
      ? {
          OR: [
            {
              name: {
                contains: options.search,
              },
            },
            {
              description: {
                contains: options.search,
              },
            },
          ],
        }
      : {};

    return prisma.product.findMany({
      where,
      include: {
        orderItems: {
          select: {
            id: true,
            quantity: true,
            order_id: true,
            product_id: true,
          }
        }
      },
      take: options.take,
      skip: options.skip,
      orderBy: options.orderBy,
    });
  }

  export async function findById(productId: string) {
    return await prisma.product.findUnique({
      where: {
        id: productId,
      },
      include: {
        orderItems: true
      },
    });
  }

  export async function update(
    productId: string,
    product: UpdateProductDto
  ) {
    return await prisma.product.update({
      where: {
        id: productId,
      },
      data: product,
    });
  }

  export async function remove(productId: string) {
    return await prisma.product.delete({
      where: {
        id: productId,
      },
    });
  }

  export async function countAll(search?: string) {
    const where = search
      ? {
          OR: [
            {
              name: {
                contains: search,
              },
            },
            {
              description: {
                contains: search,
              },
            },
          ],
        }
      : {};

    return prisma.product.count({
      where,
    });
  }
}