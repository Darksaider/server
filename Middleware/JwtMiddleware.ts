import { Elysia } from "elysia";
import { jwt } from "@elysiajs/jwt";

interface User {
  id: number;
  email: string;
  role: string;
}

const jwtMiddleware = new Elysia({ name: "jwt" })
  .use(
    jwt({
      name: "jwt",
      secret: process.env.JWT_SECRET || "default_secret",
    })
  )
  .derive({ as: "global" }, async (ctx) => {
    // Отримуємо токен з кукі
    const token = ctx.cookie.token.value;
    let user: User | null = null;

    if (token) {
      try {
        // Перевіряємо токен
        const decoded = await ctx.jwt.verify(token);

        if (decoded) {
          // Правильне перетворення типів з перевіркою необхідних полів
          const decodedObj = decoded as Record<string, unknown>;

          // Перевіряємо наявність необхідних полів з коректними типами
          if (
            typeof decodedObj.id === "number" &&
            typeof decodedObj.email === "string" &&
            typeof decodedObj.role === "string"
          ) {
            user = {
              id: decodedObj.id,
              email: decodedObj.email,
              role: decodedObj.role,
            };
          }
        }
      } catch (error) {
        console.error("Invalid token:", error);
        ctx.cookie.token.remove();
      }
    }

    return {
      user,
      hasRole: (role: string): boolean => {
        return user?.role === role || false;
      },
    };
  });

export default jwtMiddleware;
