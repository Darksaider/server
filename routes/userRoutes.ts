import { Elysia, Context } from "elysia";
import { createUser, LoginUser } from "../types/types";
import userService, { ElysiaContext } from "../services/UserService"; // Потрібно правильно експортувати ElysiaContext
import { routeErrorHandler } from "../utils/errors";
import { hashPassword } from "../utils/hashPassword";
import jwtAuth from "../Middleware/JwtMiddleware";
import jwtMiddleware from "../Middleware/JwtMiddleware";

export type ChangePassword = {
  currentPassword: string;
  newPassword: string;
};
export const userRoutes = new Elysia()
  .use(jwtMiddleware)
  .get("/users", async (context: Context) => {
    const res = await routeErrorHandler(context, () => userService.getAll());
    return res;
  })
  .get("/users/account", async (context) => {
    const data = context.user?.id;
    if (!data) {
      return "Unionization required";
    }
    const res = await routeErrorHandler(context, () =>
      userService.getById(data)
    );
    return res;
  })
  .post("/users/passwordChanges", async (context) => {
    const id = context.user?.id;
    const body = context.body as ChangePassword;
    console.log(body);

    if (!id) {
      return "Unionization required";
    }
    const res = await routeErrorHandler(context, () =>
      userService.updataPassword(body, id)
    );
    return res;
  })
  .post("/createBaseUser", async (context: Context) => {
    const data = context.body as createUser;
    const passwordGenerate = await hashPassword(data.password_hash);
    const newObj: createUser = {
      ...data,
      password_hash: passwordGenerate,
    };
    const res = await routeErrorHandler(
      context,
      async () => userService.createUser(newObj),
      201
    );
    return res;
  })

  // .put("/users/:id", async (context: Context) => {
  //   const item = context.body;
  //   const id = context.params.id;
  //   console.log(item);

  //   const res = await routeErrorHandler(context, async () =>
  //     userService.updateUser(id, item)
  //   );
  //   return res;
  // })
  .put("/users/:id", async (context: Context) => {
    const item = context.body as createUser;
    const id = context.params.id;
    console.log("this", item);

    const res = await routeErrorHandler(context, async () =>
      userService.updateUser(id, item)
    );
    return res;
  })
  .put("/users/profile", async (context) => {
    const item = context.body as createUser;
    const id = context.user?.id;
    if (!id)
      return {
        success: false,
        message: "Користувач не увійшов ",
      };
    const res = await routeErrorHandler(context, async () =>
      userService.updateUser(id, item)
    );
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

    const res = await routeErrorHandler(
      context,
      async () => userService.createUser(newObj),
      201
    );
    return res;
  })
  .post("/users/login", async (context: ElysiaContext) => {
    // Отримуємо токен від сервісу
    const token = await routeErrorHandler(context, async () =>
      userService.loginUser(context.body as LoginUser, context)
    );
    // console.log("Token:", context.body);
    console.log("Token data:", token);

    context.cookie.token.set({
      value: token.data.token,
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60, // 7 днів
      sameSite: "lax", // <--- ЗМІНЕНО ЗІ 'strict'
      path: "/", // <--- ДОДАТИ ЦЕЙ АТРИБУТ
      // secure: process.env.NODE_ENV === 'production', // Розкоментуйте для HTTPS в production
    });

    return { message: "Login successful", user: token.data.user };
  })
  .use(jwtAuth) // Додаємо middleware для аутентифікації
  .get("/me", ({ user, set }) => {
    if (!user?.id) {
      set.status = 401;

      return { message: "Unauthorized" };
    }

    return { ...user };
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
