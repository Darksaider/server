//
import prismaDb from "../prisma/prisma";
import { RepositoryError } from "../utils/errors";
import { Prisma } from "@prisma/client";
import { calculateDiscountInfo } from "../utils/calculateDiscount";
import { getFilteredProducts } from "../utils/newCode";
import { ProductFilterParams } from "../utils/fnProducts";

const deleteProduct = async (id: number) => {
  try {
    const product = await prismaDb.products.delete({
      where: { id },
    });
    return product;
  } catch (error) {
    if (error instanceof RepositoryError) {
      throw error;
    }
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      throw new RepositoryError("Продукт не знайдено");
    }
    throw new RepositoryError("Не вдалося видалити продукт", error);
  }
};

const findById = async (id: number, productInclude: any) => {
  try {
    const product = await prismaDb.products.findUnique({
      where: { id },
      ...productInclude,
    });
    if (!product) {
      throw new RepositoryError("Продукт не знайдено");
    }
    const activeDiscount = product.product_discounts[0]?.discounts;

    if (activeDiscount) {
      // Use the existing calculateDiscountInfo function
      const basePrice = Number(product.price);
      const { finalPrice, discountPercentage } = calculateDiscountInfo(
        basePrice,
        activeDiscount
      );

      return {
        ...product,
        discounted_price: new Prisma.Decimal(finalPrice),
        discount_percentage: discountPercentage,
      };
    }

    return product;
  } catch (error) {
    if (error instanceof RepositoryError) {
      throw error;
    }
    throw new RepositoryError("Не вдалося отримати продукт", error);
  }
};

const getProductNew = async (params: ProductFilterParams) => {
  try {
    const result = await getFilteredProducts(prismaDb, params);
    return result;
  } catch (error) {
    if (error instanceof RepositoryError) {
      throw error;
    }
    throw new RepositoryError("Не вдалося отримати продукт", error);
  }
};
const getProductWithDiscounts = async (params: ProductFilterParams) => {
  try {
    const result = await prismaDb.products.findMany({
      where: {
        product_discounts: {
          some: {
            discounts: {
              is_active: true,
            },
          },
        },
      },
      include: {
        product_photos: {
          select: {
            photo_url: true,
          },
          take: 1,
        },
        product_discounts: {
          include: {
            discounts: true,
          },
        },
        product_brands: {
          include: {
            brands: true,
          },
        },
        comments: true, // Додаємо коментарі для розрахунку рейтингу
      },
      orderBy: {
        created_at: "desc",
      },
    });
    if (!result || result.length === 0) {
      return result;
    }
  } catch (error) {
    if (error instanceof RepositoryError) {
      throw error;
    }
    throw new RepositoryError("Не вдалося отримати продукт", error);
  }
};
export default {
  findById,
  deleteProduct,
  getProductNew,
  getProductWithDiscounts,
};
