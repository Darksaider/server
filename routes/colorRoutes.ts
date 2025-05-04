import { Elysia, Context } from "elysia";
import { CreateColor, createUser } from "../types/types";
import userService from "../services/UserService";
import { routeErrorHandler } from "../utils/errors";
import colorService from "../services/colorService";
import {
  getAllProductAttributes,
  getUniqueProductAttributes,
} from "../repositories/filter";
export const colorRoutes = new Elysia();

colorRoutes.post("/colors", async (context) => {
  const res = await routeErrorHandler(
    context,
    async () => colorService.repository.create(context.body as createUser),
    201
  );
  return res;
});

colorRoutes.get("/get", async (context) => {
  const res = await routeErrorHandler(
    context,
    async () => getUniqueProductAttributes(),
    201
  );
  return res;
});
colorRoutes.get("/getAll", async (context) => {
  const res = await routeErrorHandler(
    context,
    async () => getAllProductAttributes(),
    201
  );
  return res;
});
colorRoutes.get("/colors", async (context) => {
  const res = await routeErrorHandler(
    context,
    async () => colorService.getAll(),
    201
  );
  return res;
});

colorRoutes.get("/color/:id", async (context) => {
  const id = context.params.id;
  const res = await routeErrorHandler(context, () => userService.getById(id));
  return res;
});

colorRoutes.put("/users/:id", async (context) => {
  const item = context.body as CreateColor;
  const id = context.params.id;
  const res = await routeErrorHandler(context, async () =>
    colorService.repository.update(id, item)
  );
  return res;
});

// userRoutes.delete("/users/:id", async (context) => {
//   const id = context.params.id;
//   const res = await routeErrorHandler(context, () => userService.repository.delete(id));
//   return res;
// });
