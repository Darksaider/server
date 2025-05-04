// src/routes/stripe.ts
import { Elysia } from "elysia";
import { PrismaClient } from "@prisma/client";
import Stripe from "stripe";
import jwtMiddleware from "../Middleware/JwtMiddleware";

const prisma = new PrismaClient();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");

export const stripeRoutes = new Elysia({ prefix: "/stripe" })
  // Створення платіжної сесії Stripe
  .use(jwtMiddleware)
  .post("/create-checkout-session", async ({ body, set, user }) => {
    try {
      const { orderId, userId } = body as { orderId: number; userId: number };

      // Отримуємо замовлення з бази даних
      const order = await prisma.orders.findUnique({
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

      if (order.user_id !== user?.id) {
        set.status = 403;
        return { error: "Доступ заборонено" };
      }

      // Створюємо лінійні елементи для Stripe
      const lineItems = order.order_items.map((item) => ({
        price_data: {
          currency: "uah",
          product_data: {
            name: item.products.name,
            description: item.products.description || undefined,
          },
          unit_amount: Math.round(Number(item.price) * 100), // Перетворюємо в копійки
        },
        quantity: item.quantity,
      }));

      // Створюємо Stripe сесію
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: lineItems,
        mode: "payment",
        success_url: `${process.env.CLIENT_URL}orders/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.CLIENT_URL}orders/cancel?order_id=${order.id}`,
        metadata: {
          orderId: order.id.toString(),
          userId: order.user_id.toString(),
        },
      });

      // Оновлюємо замовлення в БД, додаючи інформацію про Stripe сесію
      await prisma.orders.update({
        where: { id: order.id },
        data: {
          stripe_session_id: session.id,
          payment_status: "awaiting",
          updated_at: new Date(),
        },
      });

      return { sessionId: session.id, url: session.url };
    } catch (error) {
      console.error("Помилка створення платіжної сесії:", error);
      set.status = 500;
      return { error: "Не вдалося створити платіжну сесію" };
    }
  })

  // Обробник webhook подій Stripe
  .post("/webhook", async ({ request, set }) => {
    const sig = request.headers.get("stripe-signature");
    const payload = await request.text();

    try {
      const event = await stripe.webhooks.constructEventAsync(
        payload,
        sig || "",
        process.env.STRIPE_WEBHOOK_SECRET || ""
      );
      console.log(process.env.STRIPE_WEBHOOK_SECRET);

      // Обробка різних подій від Stripe
      switch (event.type) {
        case "checkout.session.completed": {
          const session = event.data.object as Stripe.Checkout.Session;

          if (!session.metadata?.orderId) {
            console.error("Не знайдено orderId в метаданих сесії");
            break;
          }

          const orderId = parseInt(session.metadata.orderId);

          // Оновлюємо статус замовлення
          await prisma.orders.update({
            where: { id: orderId },
            data: {
              status: "paid", // Змінюємо статус замовлення на "оплачено"
              payment_status: "completed",
              updated_at: new Date(),
            },
          });

          // Створюємо запис про платіж
          await prisma.payments.create({
            data: {
              order_id: orderId,
              amount: Number(session.amount_total) / 100, // Перетворюємо назад у грн з копійок
              currency: session.currency || "uah",
              payment_method: "card", // Можна розширити, якщо підтримуються інші методи
              stripe_payment_id: (session.payment_intent as string) || null,
              status: "completed",
            },
          });

          break;
        }
        case "checkout.session.expired": {
          const session = event.data.object as Stripe.Checkout.Session;

          if (session.metadata?.orderId) {
            const orderId = parseInt(session.metadata.orderId);

            // Оновлюємо статус замовлення, якщо сесія закінчилася
            await prisma.orders.update({
              where: { id: orderId },
              data: {
                payment_status: "expired",
                updated_at: new Date(),
              },
            });
          }
          break;
        }
        case "payment_intent.payment_failed": {
          const paymentIntent = event.data.object as Stripe.PaymentIntent;

          // Знаходимо замовлення за ID платіжного наміру
          const payment = await prisma.payments.findFirst({
            where: { stripe_intent_id: paymentIntent.id },
          });

          if (payment) {
            // Оновлюємо інформацію про платіж
            await prisma.payments.update({
              where: { id: payment.id },
              data: {
                status: "failed",
                error_message:
                  paymentIntent.last_payment_error?.message ||
                  "Платіж не пройшов",
                updated_at: new Date(),
              },
            });

            // Оновлюємо статус замовлення
            await prisma.orders.update({
              where: { id: payment.order_id },
              data: {
                payment_status: "failed",
                updated_at: new Date(),
              },
            });
          }
          break;
        }
      }

      return { received: true };
    } catch (err: any) {
      console.error("Помилка обробки webhook:", err);
      set.status = 400;
      return { error: "Помилка обробки webhook" };
    }
  })

  // Отримання статусу платежу за замовленням
  .get("/payment-status/:orderId", async ({ params, set }) => {
    try {
      const orderId = parseInt(params.orderId);

      const order = await prisma.orders.findUnique({
        where: { id: orderId },
        select: {
          id: true,
          status: true,
          payment_status: true,
          stripe_session_id: true,
          payments: {
            orderBy: {
              created_at: "desc",
            },
            take: 1,
          },
        },
      });

      if (!order) {
        set.status = 404;
        return { error: "Замовлення не знайдено" };
      }

      return {
        orderId: order.id,
        orderStatus: order.status,
        paymentStatus: order.payment_status,
        paymentDetails: order.payments[0] || null,
      };
    } catch (error) {
      console.error("Помилка отримання статусу платежу:", error);
      set.status = 500;
      return { error: "Не вдалося отримати статус платежу" };
    }
  });
