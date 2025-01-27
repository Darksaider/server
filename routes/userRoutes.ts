import { Elysia, Context } from "elysia";
import { createUser, Filter, User } from "../types/types";
import userService from "../services/UserService";
import { routeErrorHandler } from "../utils/errors";
import { parseFilterValue } from "../utils/fn";
export const userRoutes = new Elysia();

userRoutes.get("/users", async (context: Context) => {
  const urlParams = new URLSearchParams(context.request.url.split("?")[1]);
  const filter: Filter<User> = {};

  for (const [key, value] of urlParams.entries()) {
    const parsedValue = parseFilterValue<User>(value, key as keyof User);
    filter[key as keyof User] = parsedValue;
  }
  const res = await routeErrorHandler(context, () =>
    userService.getAll({ filter: filter }),
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
