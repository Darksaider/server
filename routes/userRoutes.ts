import { Elysia, Context } from "elysia";
import { createUser, LoginUser } from "../types/types";
import userService, { ElysiaContext } from "../services/UserService"; // Потрібно правильно експортувати ElysiaContext
import { routeErrorHandler } from "../utils/errors";
import { hashPassword } from "../utils/hashPassword";
import jwtMiddleware from "../Middleware/JwtMiddleware";

export const userRoutes = new Elysia()
  .get("/users", async (context: Context) => {
    const res = await routeErrorHandler(context, () => userService.getAll());
    return res;
  })
  .get("/users/:id", async (context: Context) => {
    const id = context.params.id;
    const res = await routeErrorHandler(context, () => userService.getById(id));
    return res;
  })
  .put("/users/:id", async (context: Context) => {
    const item = context.body as createUser;
    const id = context.params.id;
    const res = await routeErrorHandler(context, async () => userService.updateUser(id, item));
    return res;
  })
  .delete("/users/:id", async (context: Context) => {
    const id = context.params.id;
    const res = await routeErrorHandler(context, () => userService.delete(id));
    return res;
  })
  .post("/users", async (context: Context) => {
    const data = context.body as createUser;
    const passwordGenerate = await hashPassword(data.password_hash);

    const newObj: createUser = {
      ...data,
      password_hash: passwordGenerate,
    };

    const res = await routeErrorHandler(context, async () => userService.createUser(newObj), 201);
    return res;
  })
  .post("/users/login", async (context: ElysiaContext) => {
    // Отримуємо токен від сервісу
    const token = await routeErrorHandler(
      context,
      async () => userService.loginUser(context.body as LoginUser, context)
    );

    ;
    context.cookie.token.set({
      value: token.data,
      // httpOnly: true,
      // maxAge: 7 * 24 * 60 * 60,
      // sameSite: "strict"
    });

    return { message: "Login successful", token: token.data };
  })
  .use(jwtMiddleware)
  .get("/profile", ({ user, set }) => {
    if (!user) {
      set.status = 401;
      return { message: "Unauthorized" };
    }
    return { user };
  })
  .get("/admin", ({ user, hasRole, set }) => {
    if (!user) {
      set.status = 401;
      return { message: "Unauthorized" };
    }

    if (!hasRole("admin")) {
      set.status = 403;
      return { message: "Forbidden" };
    }

    return { message: "Welcome, admin!" };
  });
