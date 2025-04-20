// src/index.ts
import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { PrismaClient } from "@prisma/client";
import Stripe from "stripe";

const orderRoutes = new Elysia();
const prisma = new PrismaClient();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");

orderRoutes.post("/api/create-checkout-session", async ({ body, set }) => {
  try {
    const { items, userId } = body as { items: any[]; userId: string };

    if (!items || items.length === 0) {
      set.status = 400;
      return { error: "Товари не вказані" };
    }

    // Створюємо лінійні елементи для Stripe
    const lineItems = items.map((item) => ({
      price_data: {
        currency: "uah",
        product_data: {
          name: item.name,
          description: item.description,
        },
        unit_amount: Math.round(item.price * 100), // Ціна в копійках
      },
      quantity: item.quantity,
    }));

    // Створюємо сесію Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${process.env.CLIENT_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/cancel`,
      metadata: {
        userId,
      },
    });

    return { sessionId: session.id, url: session.url };
  } catch (error) {
    console.error("Помилка створення сесії платежу:", error);
    set.status = 500;
    return { error: "Не вдалося створити сесію платежу" };
  }
});

// Обробник webhook подій від Stripe
orderRoutes.post("/api/webhook", async ({ request, set }) => {
  const sig = request.headers.get("stripe-signature");
  const payload = await request.text();

  try {
    const event = stripe.webhooks.constructEvent(
      payload,
      sig || "",
      process.env.STRIPE_WEBHOOK_SECRET || ""
    );

    // Обробка різних подій Stripe
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        // Отримуємо дані замовлення
        const userId = session.metadata?.userId;

        if (userId) {
          // Створюємо замовлення в базі даних
          await prisma.order.create({
            data: {
              userId,
              stripeSessionId: session.id,
              status: "PAID",
              amount: session.amount_total ? session.amount_total / 100 : 0,
              currency: session.currency || "uah",
              // Додайте інші поля, які вам потрібні
            },
          });
        }
        break;
      }
      // Інші події, які вам можуть знадобитися
      case "payment_intent.succeeded":
      case "payment_intent.payment_failed":
        // Обробка інших подій
        break;
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    return { received: true };
  } catch (err) {
    console.error("Помилка обробки webhook:", err);
    set.status = 400;
    return { error: "Помилка обробки webhook" };
  }
});

// Маршрут для отримання списку замовлень для користувача
orderRoutes.get("/api/orders/:userId", async ({ params }) => {
  try {
    const orders = await prisma.order.findMany({
      where: {
        userId: params.userId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return orders;
  } catch (error) {
    console.error("Помилка отримання замовлень:", error);
    return { error: "Не вдалося отримати замовлення" };
  }
});

orderRoutes.listen(process.env.PORT || 3000, () => {
  console.log(`🦊 Сервер запущений на порту ${process.env.PORT || 3000}`);
});
