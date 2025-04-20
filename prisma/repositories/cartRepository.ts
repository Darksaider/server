// src/repositories/favorites.repository.ts

import { Cart, CreateCart } from "../../types/types";
import prismaDb from "../prisma";

export const cartRepository = {
  async findByUserId(userId: number) {
    return prismaDb.cart.findMany({
      where: {
        user_id: userId,
      },
      select: {
        id: true,
        quantity: true,
        added_at: true,

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
  },

  async add(userId: number, data: CreateCart) {
    return prismaDb.cart.create({
      data: {
        user_id: userId,
        product_id: +data.product_id,
        quantity: data.quantity, // Додаємо кількість за замовчуванням
      },
    });
  },

  async remove(userId: number, productId: number) {
    try {
      return await prismaDb.cart.delete({
        where: {
          user_id_product_id: {
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
