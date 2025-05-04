// src/services/favorites.service.ts
import { NotFoundError } from "elysia"; // Для кидання семантичних помилок
import { cartRepository } from "../repositories/cartRepository";
import { Cart, CreateCart } from "../types/types";

export const cartService = {
  /**
   * Отримує список улюблених товарів для користувача.
   */
  async getUserCart(userId: number) {
    // Просто викликаємо репозиторій
    const favorites = await cartRepository.findByUserId(userId);

    // Можна додати логіку мапінгу результату, якщо потрібно
    return favorites;
  },

  /**
   * Додає товар до улюблених.
   * Можна додати перевірки (чи існує товар, чи не додано вже).
   */
  async addUserCart(userId: number, data: CreateCart) {
    // Опціональна перевірка: чи існує такий товар взагалі?
    // const productExists = await prisma.products.count({ where: { id: productId } }) > 0;
    // if (!productExists) {
    //   throw new NotFoundError(`Product with ID ${productId} not found`);
    // }

    try {
      const newFavorite = await cartRepository.add(userId, data);
      return newFavorite;
    } catch (error: any) {
      // Обробка помилки унікальності (якщо запис вже існує)
      if (error.code === "P2002") {
        console.warn(
          `Attempted to add existing : user ${userId}, product ${data.product_id}`
        );
        return null; // Або кинути кастомну помилку "Already Exists"
      }
      console.error("Error adding favorite in service:", error);
      throw new Error("Failed to add favorite due to a database error.");
    }
  },

  /**
   * Видаляє товар з улюблених.
   */
  async removeCart(cartId: number, userId: number) {
    const deletedFavorite = await cartRepository.remove(cartId, userId);

    if (deletedFavorite === null) {
      // Якщо репозиторій повернув null, значить запис не знайдено
      throw new NotFoundError(`Favorite no delete cart id${cartId} not found.`);
    }
    return true; // Або return deletedFavorite;
  },
};
