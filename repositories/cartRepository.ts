import { Prisma } from "@prisma/client";
import { CreateCart } from "../types/types";
import prismaDb from "../prisma/prisma";
import { calculateDiscountInfo } from "../utils/calculateDiscount";
import { updateQuantityType } from "../services/CardService";

export const cartRepository = {
  async findByUserId(userId: number) {
    const cart = await prismaDb.cart.findMany({
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
          },
        },
        colors: true, // Включаємо інформацію про колір
        sizes: true, // Включаємо інформацію про розмір
      },
      orderBy: {
        added_at: "desc",
      },
    });

    // Трансформуємо дані у потрібний формат, ідентичний з findByProductIds
    const result = cart.map((cartItem) => {
      const product = cartItem.products;

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

      return {
        cartId: cartItem.id, // Додатково зберігаємо ID запису в корзині
        product_id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        stock: product.stock,
        photo_url: product.product_photos[0]?.photo_url,
        color: cartItem.colors,
        size: cartItem.sizes,
        quantity: cartItem.quantity,
        added_at: cartItem.added_at,
        discounted_price,
        discount_percentage,
      };
    });

    return result;
  },

  async findByProductIds(
    cartItems: { product_id: number; color_id?: number; size_id?: number }[]
  ) {
    if (!cartItems || cartItems.length === 0) {
      return [];
    }

    const productIds = cartItems.map((item) => item.product_id);

    const products = await prismaDb.products.findMany({
      where: {
        id: {
          in: productIds,
        },
      },
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
      },
    });

    // Отримуємо дані про кольори
    const colorIds = cartItems
      .filter((item) => item.color_id !== undefined)
      .map((item) => item.color_id as number);

    const colors =
      colorIds.length > 0
        ? await prismaDb.colors.findMany({
            where: {
              id: {
                in: colorIds,
              },
            },
          })
        : [];

    // Отримуємо дані про розміри
    const sizeIds = cartItems
      .filter((item) => item.size_id !== undefined)
      .map((item) => item.size_id as number);

    const sizes =
      sizeIds.length > 0
        ? await prismaDb.sizes.findMany({
            where: {
              id: {
                in: sizeIds,
              },
            },
          })
        : [];

    // Формуємо результат з даними про продукти, кольори і розміри
    const result = cartItems
      .map((cartItem) => {
        const product = products.find((p) => p.id === cartItem.product_id);
        const color = cartItem.color_id
          ? colors.find((c) => c.id === cartItem.color_id)
          : null;
        const size = cartItem.size_id
          ? sizes.find((s) => s.id === cartItem.size_id)
          : null;

        if (!product) {
          return null;
        }

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

        return {
          product_id: product.id,
          name: product.name,
          description: product.description,
          price: product.price,
          stock: product.stock,
          photo_url: product.product_photos[0]?.photo_url,
          color: color,
          size: size,
          discounted_price,
          discount_percentage,
        };
      })
      .filter((item) => item !== null);

    return result;
  },

  async add(userId: number, data: CreateCart) {
    return prismaDb.cart.create({
      data: {
        user_id: userId,
        product_id: +data.product_id,
        color_id: data.color_id,
        size_id: data.size_id,
      },
    });
  },

  async remove(cartId: number, userId: number) {
    try {
      return await prismaDb.cart.delete({
        where: {
          id: cartId,
          user_id: userId,
        },
      });
    } catch (error: any) {
      if (error.code === "P2025") {
        return null;
      }
      throw error;
    }
  },

  async updateQuantity(data: updateQuantityType) {
    try {
      const quantity = data.quantity;
      return await prismaDb.cart.update({
        where: {
          id: data.cartId,
          user_id: data.userId,
        },
        data: {
          quantity,
        },
      });
    } catch (error: any) {
      if (error.code === "P2025") {
        return null;
        2;
      }
      throw error;
    }
  },

  // Метод для перевірки наявності товару в корзині
  async exists(
    userId: number,
    productId: number,
    colorId?: number,
    sizeId?: number
  ): Promise<boolean> {
    const whereClause: any = {
      user_id: userId,
      product_id: productId,
    };

    if (colorId !== undefined) {
      whereClause.color_id = colorId;
    }

    if (sizeId !== undefined) {
      whereClause.size_id = sizeId;
    }

    const count = await prismaDb.cart.count({
      where: whereClause,
    });

    return count > 0;
  },
};
