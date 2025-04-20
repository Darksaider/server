// src/repositories/favorites.repository.ts

import { NotFoundError } from "elysia";
import { RepositoryError } from "../../utils/errors";
import prismaDb from "../prisma";

export const favoritesRepository = {
  async findByUserId(userId: number) {
    // return prismaDb.favorites.findMany({
    //   where: {
    //     user_id: userId,
    //   },
    //   include: {
    //     products: true,
    //   },
    //   orderBy: {
    //     added_at: "desc",
    //   },
    // });
    try {
      const res = await prismaDb.favorites.findMany({
        where: {
          user_id: userId,
        },
        include: {
          products: true,
        },
        orderBy: {
          added_at: "desc",
        },
      });
      if (!res) {
        throw new NotFoundError(`Data for favorites not found`);
      }
      return res;
    } catch (error: any) {
      throw new RepositoryError(`Failed to find many favorites`, error);
    }
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
