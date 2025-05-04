// src/routes/orders.ts
import { Elysia } from "elysia";
import prismaDb from "../prisma/prisma";
import jwtMiddleware from "../Middleware/JwtMiddleware";

export const orderRoutes = new Elysia()
  .use(jwtMiddleware)
  .get("/orders/:id", async ({ params, set }) => {
    try {
      const userId = +params.id;
      console.log("ID користувача:", userId);

      const orders = await prismaDb.orders.findMany({
        where: { user_id: userId },
        include: {
          order_items: {
            include: {
              products: true,
            },
          },
        },
        orderBy: {
          created_at: "desc",
        },
      });

      return orders;
    } catch (error) {
      console.error("Помилка отримання замовлень:", error);
      set.status = 500;
      return { error: "Не вдалося отримати замовлення" };
    }
  })

  // Отримання деталей конкретного замовлення
  .get("/order/:orderId", async ({ params, set }) => {
    try {
      const orderId = parseInt(params.orderId);

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
        set.status = 404;
        return { error: "Замовлення не знайдено" };
      }

      return order;
    } catch (error) {
      console.error("Помилка отримання замовлення:", error);
      set.status = 500;
      return { error: "Не вдалося отримати деталі замовлення" };
    }
  })

  // Виправлено шлях - додано слеш перед "orders"
  .post("/orders", async ({ body, set, user }) => {
    try {
      if (!user?.id) {
        set.status = 401;
        console.log("Користувач не автентифікований:", user);
        return { error: "Authentication required" };
      }

      // Перетворення user.id до числового типу
      const userId = parseInt(user.id.toString());

      // Перевірка чи існує користувач
      const userExists = await prismaDb.users.findUnique({
        where: { id: userId },
      });

      if (!userExists) {
        set.status = 404;
        return { error: "Користувача не знайдено" };
      }

      const { items, shippingAddress, paymentMethod, notes } = body as {
        items: Array<{
          productId: number;
          quantity: number;
          price: number;
        }>;
        shippingAddress: string;
        paymentMethod: string;
        notes?: string;
      };

      console.log("Отримані дані:", {
        userId,
        items,
        shippingAddress,
        paymentMethod,
        notes,
      });

      // Перевірка наявності товарів у замовленні
      if (!items || items.length === 0) {
        set.status = 400;
        return { error: "Замовлення повинно містити хоча б один товар" };
      }

      // Розрахунок загальної суми замовлення
      const totalAmount = items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );

      // Створюємо замовлення в транзакції
      const order = await prismaDb.$transaction(async (tx) => {
        // Перевірка наявності товарів на складі перед створенням замовлення
        for (const item of items) {
          const product = await tx.products.findUnique({
            where: { id: item.productId },
          });

          if (!product) {
            throw new Error(`Товар з ID ${item.productId} не знайдено`);
          }

          if (product.stock === null || product.stock < item.quantity) {
            throw new Error(
              `Недостатня кількість товару ${product.name} на складі`
            );
          }
        }

        // Створюємо основний запис замовлення
        const newOrder = await tx.orders.create({
          data: {
            user_id: userId,
            status: "pending", // Початковий статус
            total_amount: totalAmount,
            shipping_address: shippingAddress,
            payment_method: paymentMethod,
            payment_status: "pending",
            notes: notes || null, // Переконуємось, що notes не undefined
          },
        });

        // Створюємо елементи замовлення
        for (const item of items) {
          await tx.order_items.create({
            data: {
              order_id: newOrder.id,
              product_id: item.productId,
              quantity: item.quantity,
              price: item.price,
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
        message: "Замовлення успішно створено",
      };
    } catch (error: any) {
      console.error("Помилка створення замовлення:", error);
      set.status = 500;
      return {
        error: `Не вдалося створити замовлення: ${error.message || error}`,
      };
    }
  })

  // Оновлення статусу замовлення - виправлено шлях
  .patch("/order/:orderId/status", async ({ params, body, set }) => {
    try {
      const orderId = parseInt(params.orderId);
      const { status } = body as { status: string };

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
      set.status = 500;
      return { error: "Не вдалося оновити статус замовлення" };
    }
  })

  // Скасування замовлення - виправлено шлях
  .post("/order/:orderId/cancel", async ({ params, body, set }) => {
    try {
      const orderId = parseInt(params.orderId);
      const { reason } = body as { reason?: string };

      // Отримуємо поточне замовлення з товарами
      const order = await prismaDb.orders.findUnique({
        where: { id: orderId },
        include: {
          order_items: true,
        },
      });

      if (!order) {
        set.status = 404;
        return { error: "Замовлення не знайдено" };
      }

      // Перевіряємо, чи можна скасувати замовлення
      if (["delivered", "completed"].includes(order.status)) {
        set.status = 400;
        return {
          error:
            "Неможливо скасувати замовлення, яке вже доставлене або завершене",
        };
      }

      // Скасовуємо замовлення в транзакції
      const cancelledOrder = await prismaDb.$transaction(async (tx) => {
        // Оновлюємо статус замовлення
        const updated = await tx.orders.update({
          where: { id: orderId },
          data: {
            status: "cancelled",
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
      set.status = 500;
      return { error: "Не вдалося скасувати замовлення" };
    }
  });
