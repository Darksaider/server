// src/repositories/favorites.repository.ts

import { Prisma } from "@prisma/client";
import { CreateCart } from "../types/types";
import prismaDb from "../prisma/prisma";
import { calculateDiscountInfo } from "../utils/calculateDiscount";

export const cartRepository = {
  async findByUserId(userId: number) {
    const cart = await prismaDb.cart.findMany({
      where: {
        user_id: userId,
      },
      select: {
        id: true,
        quantity: true,
        added_at: true,
        color_id: true,
        size_id: true,

        products: {
          select: {
            id: true,
            name: true,
            description: true,
            price: true,
            stock: true,

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

            // product_brands: {
            //   select: {
            //     brands: { // Включаємо дані самого бренду
            //       select: { name: true }
            //     }
            //   },
            //   take: 1 // Зазвичай у продукта один бренд
            // }
          },
        },
      },
      orderBy: {
        added_at: "desc", // Сортуємо самі елементи кошика за датою додавання
      },
    });
    const cartWithDiscounts = cart.map((cartItem) => {
      // Get the first active discount (as you mentioned only one should be used)
      const activeDiscount = cartItem.products.product_discounts[0]?.discounts;

      if (activeDiscount) {
        // Use the existing calculateDiscountInfo function
        const basePrice = Number(cartItem.products.price);
        const { finalPrice, discountPercentage } = calculateDiscountInfo(
          basePrice,
          activeDiscount
        );

        return {
          ...cartItem,
          discounted_price: new Prisma.Decimal(finalPrice),
          discount_percentage: discountPercentage,
        };
      }

      return cartItem;
    });
    return cartWithDiscounts;
  },

  async add(userId: number, data: CreateCart) {
    console.log("repo", data);

    return prismaDb.cart.create({
      data: {
        user_id: userId,
        product_id: +data.product_id,
        color_id: data.color_id, // Додаємо кількість за замовчуванням
        size_id: data.size_id, // Додаємо кількість за замовчуванням
      },
    });
  },

  async remove(cartId: number, userId: number) {
    try {
      return await prismaDb.cart.delete({
        where: {
          id: cartId,
          user_id: userId, // Додаємо умову на ID юзера
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
