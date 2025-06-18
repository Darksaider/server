import { error, t } from "elysia";
import prismaDb from "../prisma/prisma";
import { CreateOrder, User } from "../types/types";
import { RepositoryError } from "../utils/errors";
import { ORDER_STATUS, PAYMENT_STATUS } from "../utils/constans";

export const getAllOrders = async (user: User) => {
  try {
    const orders = await prismaDb.orders.findMany({
      include: {
        order_items: {
          include: {
            products: {
              include: {
                product_colors: {
                  include: {
                    colors: true,
                  },
                },
                product_sizes: {
                  include: {
                    sizes: true,
                  },
                },
              },
            },
            colors: true, // колір вибраний у замовленні
            sizes: true, // розмір вибраний у замовленні
          },
        },
      },
      orderBy: {
        created_at: "desc",
      },
    });
    function transformOrders(rawOrders: any) {
      return rawOrders.map((rawOrder: any) => ({
        id: rawOrder.id,
        userId: rawOrder.user_id,
        status: rawOrder.status,
        totalAmount: rawOrder.total_amount,
        shippingAddress: rawOrder.shipping_address,
        paymentMethod: rawOrder.payment_method,
        paymentStatus: rawOrder.payment_status,
        createdAt: rawOrder.created_at,
        updatedAt: rawOrder.updated_at,
        items: rawOrder.order_items.map((item: any) => ({
          id: item.id,
          productId: item.product_id,
          quantity: item.quantity,
          price: item.price,
          selectedColor: {
            id: item.colors.id,
            name: item.colors.name,
            hexCode: item.colors.hex_code,
          },
          selectedSize: {
            id: item.sizes.id,
            size: item.sizes.size,
          },
          product: {
            id: item.products.id,
            name: item.products.name,
            description: item.products.description,
            price: item.products.price,
            stock: item.products.stock,
            salesCount: item.products.sales_count,
            colors: item.products.product_colors.map((pc: any) => ({
              id: pc.colors.id,
              name: pc.colors.name,
              hexCode: pc.colors.hex_code,
            })),
            sizes: item.products.product_sizes.map((ps: any) => ({
              id: ps.sizes.id,
              size: ps.sizes.size,
            })),
          },
        })),
      }));
    }

    return transformOrders(orders);
  } catch (error) {
    return { error: "Не вдалося отримати замовлення" };
  }
};

export const getOrderByUserId = async (userId: number) => {
  try {
    const orders = await prismaDb.orders.findMany({
      where: { user_id: userId },
      include: {
        order_items: {
          include: {
            products: true,
            colors: true,
            sizes: true,
          },
        },
      },
      orderBy: {
        created_at: "desc",
      },
    });

    return orders;
  } catch (error) {
    return { error: "Не вдалося отримати замовлення" };
  }
};

export const getOrderById = async (orderId: number) => {
  try {
    const order = await prismaDb.orders.findUnique({
      where: { id: orderId },
      include: {
        order_items: {
          include: {
            products: true,
          },
        },
      },
    });

    if (!order) {
      throw new Error("Замовлення не знайдено");
    }

    return order;
  } catch (error) {
    throw new Error("Не вдалося отримати деталі замовлення");
  }
};

export const updateOrderStatus = async (orderId: number, status: string) => {
  try {
    const updatedOrder = await prismaDb.orders.update({
      where: { id: orderId },
      data: {
        status,
        updated_at: new Date(),
      },
    });

    return updatedOrder;
  } catch (error) {
    console.error("Помилка оновлення статусу замовлення:", error);
    return { error: "Не вдалося оновити статус замовлення" };
  }
};

export const orderCancel = async (orderId: number, reason: string) => {
  try {
    // Отримуємо поточне замовлення з товарами
    const order = await prismaDb.orders.findUnique({
      where: { id: orderId },
      include: {
        order_items: true,
      },
    });

    if (!order) {
      throw new RepositoryError("Замовлення не знайдено");
    }

    // Перевіряємо, чи можна скасувати замовлення
    if (["delivered", "completed"].includes(order.status)) {
      throw new Error(
        "Неможливо скасувати замовлення, яке вже доставлене або завершене"
      );
    }

    // Скасовуємо замовлення в транзакції
    const cancelledOrder = await prismaDb.$transaction(async (tx) => {
      // Оновлюємо статус замовлення
      const updated = await tx.orders.update({
        where: { id: orderId },
        data: {
          status: ORDER_STATUS.Cancelled,
          notes: order.notes
            ? `${order.notes}\nСкасовано: ${reason || "Причина не вказана"}`
            : `Скасовано: ${reason || "Причина не вказана"}`,
          updated_at: new Date(),
        },
      });

      for (const item of order.order_items) {
        await tx.products.update({
          where: { id: item.product_id },
          data: {
            stock: {
              increment: item.quantity,
            },
            sales_count: {
              decrement: item.quantity,
            },
          },
        });
      }

      return updated;
    });

    return {
      success: true,
      order: cancelledOrder,
      message: "Замовлення успішно скасовано",
    };
  } catch (error) {
    console.error("Помилка скасування замовлення:", error);
    return { error: "Не вдалося скасувати замовлення" };
  }
};

export const createOrder = async (userId: number, createOrder: CreateOrder) => {
  try {
    // Перетворення user.id до числового типу

    // Перевірка чи існує користувач
    const userExists = await prismaDb.users.findUnique({
      where: { id: userId },
    });

    if (!userExists) {
      throw new RepositoryError("Користувача не знайдено");
    }

    const { items, shippingAddress, paymentMethod, notes } = createOrder;

    // Перевірка наявності товарів у замовленні
    if (!items || items.length === 0) {
      throw new RepositoryError("Замовлення повинно містити хоча б один товар");
    }

    // Створюємо замовлення в транзакції
    const order = await prismaDb.$transaction(async (tx) => {
      // Валідація товарів та збір інформації про ціни
      const validatedItems = [];
      let totalAmount = 0;

      for (const item of items) {
        // Отримуємо повну інформацію про продукт
        const product = await tx.products.findUnique({
          where: { id: item.productId },
          include: {
            product_colors: {
              where: { color_id: item.colorId },
              include: { colors: true },
            },
            product_sizes: {
              where: { size_id: item.sizeId },
              include: { sizes: true },
            },
            product_discounts: {
              where: {
                product_id: item.productId,
              },
              include: {
                discounts: true,
              },
            },
          },
        });

        if (!product) {
          throw new Error(`Товар з ID ${item.productId} не знайдено`);
        }

        // Перевірка наявності кольору для цього продукту
        if (product.product_colors.length === 0) {
          throw new Error(
            `Колір з ID ${item.colorId} недоступний для товару ${product.name}`
          );
        }

        // Перевірка наявності розміру для цього продукту
        if (product.product_sizes.length === 0) {
          throw new Error(
            `Розмір з ID ${item.sizeId} недоступний для товару ${product.name}`
          );
        }

        // Перевірка кількості на складі
        if (product.stock === null || product.stock < item.quantity) {
          throw new Error(
            `Недостатня кількість товару ${product.name} на складі`
          );
        }

        // Перевірка на позитивну кількість
        if (item.quantity <= 0) {
          throw new Error(
            `Кількість товару ${product.name} повинна бути більше 0`
          );
        }
        const discount = product.product_discounts?.[0]?.discounts;
        let serverPrice = Number(product.price);

        // Перевіряємо чи є знижка і чи вона активна
        if (
          discount &&
          discount.is_active &&
          new Date(discount.start_date) <= new Date() &&
          new Date(discount.end_date) >= new Date()
        ) {
          const discountAmount =
            (serverPrice * +discount.discount_percentage) / 100;
          serverPrice = serverPrice - discountAmount;
        }

        const itemTotal = serverPrice * item.quantity;
        totalAmount += itemTotal;

        validatedItems.push({
          productId: item.productId,
          quantity: item.quantity,
          price: serverPrice, // Ціна з сервера
          colorId: item.colorId,
          sizeId: item.sizeId,
          product: product,
        });
      }

      // Перевірка на унікальність комбінацій продукт+колір+розмір
      const uniqueCheck = new Set();
      for (const item of validatedItems) {
        const key = `${item.productId}-${item.colorId}-${item.sizeId}`;
        if (uniqueCheck.has(key)) {
          throw new Error(
            `Дублікат товару ${item.product.name} з однаковим кольором та розміром. Об'єднайте кількість.`
          );
        }
        uniqueCheck.add(key);
      }

      // Створюємо основний запис замовлення
      const newOrder = await tx.orders.create({
        data: {
          user_id: userId,
          status: ORDER_STATUS.Pending, // Початковий статус
          total_amount: totalAmount,
          shipping_address: shippingAddress,
          payment_method: paymentMethod,
          payment_status: PAYMENT_STATUS.Awaiting,
          notes: notes || null,
        },
      });

      // Створюємо елементи замовлення з кольором та розміром
      for (const item of validatedItems) {
        await tx.order_items.create({
          data: {
            order_id: newOrder.id,
            product_id: item.productId,
            quantity: item.quantity,
            price: item.price, // Ціна з сервера
            color_id: item.colorId, // Додаємо колір
            size_id: item.sizeId, // Додаємо розмір
          },
        });

        // Оновлюємо кількість на складі та лічильник продажів
        await tx.products.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity,
            },
            sales_count: {
              increment: item.quantity,
            },
          },
        });
      }

      // Очищаємо кошик після створення замовлення
      await tx.cart.deleteMany({
        where: {
          user_id: userId,
        },
      });

      return newOrder;
    });

    return {
      success: true,
      orderId: order.id,
      totalAmount: order.total_amount,
      message: "Замовлення успішно створено",
    };
  } catch (error: any) {
    throw new RepositoryError("Помилка створення замовлення:", error);
  }
};
