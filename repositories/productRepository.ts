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

// const getProductsByNewFilter = async (filter: any) => {
//   try {
//     const products = await prismaDb.products.findMany({
//       ...filter,
//     });
//     const productsCourt = await prismaDb.products.count({
//       where: {
//         ...filter.where,
//       },
//     });
//     const productsWithDiscounts = products.map((product) => {
//       // Get the first active discount (as you mentioned only one should be used)
//       const activeDiscount = product.product_discounts[0]?.discounts;

//       if (activeDiscount) {
//         // Use the existing calculateDiscountInfo function
//         const basePrice = Number(product.price);
//         const { finalPrice, discountPercentage } = calculateDiscountInfo(
//           basePrice,
//           activeDiscount
//         );

//         return {
//           ...product,
//           discounted_price: new Prisma.Decimal(finalPrice),
//           discount_percentage: discountPercentage,
//         };
//       }

//       return product;
//     });

//     return { products: productsWithDiscounts, productsCourt };
//   } catch (error) {
//     throw new RepositoryError("Не вдалося отримати продукти", error);
//   }
// };

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
export default {
  findById,
  // getProductsByNewFilter,
  deleteProduct,
  getProductNew,
};
