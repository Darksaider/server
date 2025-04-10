import { Elysia } from "elysia";
import { CreateCategory } from "../types/types";
import { routeErrorHandler } from "../utils/errors";
import categoryService from "../services/CategoryService";
export const categoryRoutes = new Elysia();

categoryRoutes.post("/category", async (context) => {
  const res = await routeErrorHandler(
    context,
    async () => categoryService.createCategory(context.body as CreateCategory),
    201
  );
  return res;
});

categoryRoutes.get("/categories", async (context) => {
  const res = await routeErrorHandler(
    context,
    async () => categoryService.getAll(),
    201
  );
  return res;
});

categoryRoutes.delete("/category/:id", async (context) => {
  const id = context.params.id;
  const res = await routeErrorHandler(context, () =>
    categoryService.delete(id)
  );
  return res;
});
categoryRoutes.put("/category/:id", async (context) => {
  const id = context.params.id;
  const data = context.body as CreateCategory;
  const res = await routeErrorHandler(context, () =>
    categoryService.updateCategory(+id, data)
  );
  return res;
});
