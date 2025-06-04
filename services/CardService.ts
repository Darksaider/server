// src/services/favorites.service.ts
import { NotFoundError } from "elysia"; // Для кидання семантичних помилок
import { cartRepository } from "../repositories/cartRepository";
import { Cart, CreateCart } from "../types/types";
import prismaDb from "../prisma/prisma";
export type updateQuantityType = {
  userId: number;
  cartId: number;
  quantity: number;
};

export const cartService = {
  async getUserCart(userId: number) {
    const favorites = await cartRepository.findByUserId(userId);
    return favorites;
  },

  async addUserCart(userId: number, data: CreateCart) {
    // Опціональна перевірка: чи існує такий товар взагалі?
    const productExists =
      (await prismaDb.products.count({ where: { id: data.product_id } })) > 0;
    if (!productExists) {
      throw new NotFoundError(`Product with ID ${data.product_id} not found`);
    }

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

  async removeCart(cartId: number, userId: number) {
    const deletedFavorite = await cartRepository.remove(cartId, userId);

    if (deletedFavorite === null) {
      throw new NotFoundError(`Favorite no delete cart id${cartId} not found.`);
    }
    return true; // Або return deletedFavorite;
  },
  async getLocal(data) {
    const getLocalCarts = await cartRepository.findByProductIds(data);

    if (getLocalCarts === null) {
      throw new NotFoundError(`Favorite no get cart.`);
    }
    return getLocalCarts; // Або return deletedFavorite;
  },
  async updateQuantity(data: updateQuantityType) {
    const getLocalCarts = await cartRepository.updateQuantity(data);

    if (getLocalCarts === null) {
      throw new NotFoundError(`Favorite no get cart.`);
    }
    return getLocalCarts; // Або return deletedFavorite;
  },
};
