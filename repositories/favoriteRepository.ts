// src/repositories/favorites.repository.ts

import { NotFoundError } from "elysia";
import { RepositoryError } from "../utils/errors";
import prismaDb from "../prisma/prisma";
import { calculateDiscountInfo } from "../utils/calculateDiscount";
import { Prisma } from "@prisma/client";
import { calculateRating } from "../utils/newCode";

export const favoritesRepository = {
  async findByUserId(userId: number) {
    const favorites = await prismaDb.favorites.findMany({
      where: {
        user_id: userId,
      },
      include: {
        products: {
          select: {
            id: true,
            name: true,
            description: true,
            price: true,
            stock: true,
            sales_count: true, // Додаємо кількість продажів

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
              take: 1,
            },
            product_brands: {
              include: {
                brands: true,
              },
            },
            comments: true, // Додаємо коментарі для розрахунку рейтингу
          },
        },
      },
      orderBy: {
        added_at: "desc",
      },
    });

    // Трансформуємо дані у потрібний формат, ідентичний з findByProductIds
    const result = favorites.map((favoriteItem) => {
      const product = favoriteItem.products;

      // Розрахунок знижки, якщо вона є
      const activeDiscount = product.product_discounts[0]?.discounts;
      let discounted_price = undefined;
      let discount_percentage = undefined;

      if (activeDiscount) {
        const basePrice = Number(product.price);
        const discountInfo = calculateDiscountInfo(basePrice, activeDiscount);
        discounted_price = new Prisma.Decimal(discountInfo.finalPrice);
        discount_percentage = discountInfo.discountPercentage;
      }
      const { rating, reviewsCount } = calculateRating(product.comments);

      const newProduct = {
        ...product,
        discounted_price: discounted_price?.toString(),
        discount_percentage: discount_percentage,
        product_discounts: product.product_discounts[0]?.discounts,
        product_id: product.id,
        name: product.name,
        price: product.price,
        stock: product.stock,
        product_photos: product.product_photos,
        product_brands: product.product_brands[0]?.brands,
        description: product.description,
        rating: rating,
        reviews_count: reviewsCount,

        // Додаємо фотографії продукту
      };
      return {
        cartId: favoriteItem.id, // Додатково зберігаємо ID запису в корзині
        added_at: favoriteItem.added_at,
        products: newProduct, // Повертаємо новий продукт з розрахованою знижкою
        // Додаємо інформацію про бренд
      };
    });

    return result;
  },

  async add(userId: number, productId: number) {
    return prismaDb.favorites.create({
      data: {
        user_id: userId,
        product_id: productId,
      },
    });
  },

  async remove(userId: number, productId: number) {
    try {
      return await prismaDb.favorites.delete({
        where: {
          user_id_product_id: {
            // Назва індексу з твоєї схеми
            user_id: userId,
            product_id: productId,
          },
        },
      });
    } catch (error: any) {
      if (error.code === "P2025") {
        return null; // Повертаємо null, щоб сервіс знав, що нічого не було видалено
      }
      throw error; // Перекидаємо інші помилки
    }
  },

  // async exists(userId: number, productId: number): Promise<boolean> {
  //   const count = await prismaDb.favorites.count({
  //     where: {
  //       user_id_product_id: {
  //         user_id: userId,
  //         product_id: productId,
  //       },
  //     },
  //   });
  //    return count > 0;
  // }
};
