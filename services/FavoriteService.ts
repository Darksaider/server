// src/services/favorites.service.ts
import { NotFoundError } from "elysia"; // Для кидання семантичних помилок
import { favoritesRepository } from "../prisma/repositories/favoriteRepository";
import prismaDb from "../prisma/prisma";

export const favoritesService = {
  async getUserFavorites(userId: number) {
    const favorites = await favoritesRepository.findByUserId(userId);
    return favorites;
  },

  async addFavorite(userId: number, productId: number) {
    const productExists =
      (await prismaDb.products.count({ where: { id: productId } })) > 0;
    if (!productExists) {
      throw new NotFoundError(`Product with ID ${productId} not found`);
    }

    try {
      // Репозиторій обробить помилку дублювання через unique constraint
      const newFavorite = await favoritesRepository.add(userId, productId);
      return newFavorite;
    } catch (error: any) {
      // Обробка помилки унікальності (якщо запис вже існує)
      if (error.code === "P2002") {
        console.warn(
          `Attempted to add existing favorite: user ${userId}, product ${productId}`
        );
        return null; // Або кинути кастомну помилку "Already Exists"
      }
      console.error("Error adding favorite in service:", error);
      throw new Error("Failed to add favorite due to a database error.");
    }
  },

  async removeFavorite(userId: number, productId: number) {
    const deletedFavorite = await favoritesRepository.remove(userId, productId);

    if (deletedFavorite === null) {
      // Якщо репозиторій повернув null, значить запис не знайдено
      throw new NotFoundError(
        `Favorite entry for user ${userId} and product ${productId} not found.`
      );
    }
    return true;
  },
};
