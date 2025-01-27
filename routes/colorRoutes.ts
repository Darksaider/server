import { Elysia, Context } from "elysia";
import { createUser } from "../types/types";
import userService from "../services/UserService";
import { routeErrorHandler } from "../utils/errors";
export const userRoutes = new Elysia();

userRoutes.get("/users", async (context: Context) => {});
userRoutes.post("/users", async (context) => {
  const res = await routeErrorHandler(
    context,
    async () => userService.createUser(context.body as createUser),
    201,
  );
  return res;
});

userRoutes.get("/users/:id", async (context) => {
  const id = context.params.id;
  const res = await routeErrorHandler(context, () => userService.getById(id));
  return res;
});

userRoutes.put("/users/:id", async (context) => {
  const item = context.body as createUser;
  const id = context.params.id;
  const res = await routeErrorHandler(context, async () =>
    userService.updateUser(id, item),
  );
  return res;
});

userRoutes.delete("/users/:id", async (context) => {
  const id = context.params.id;
  const res = await routeErrorHandler(context, () => userService.delete(id));
  return res;
});
