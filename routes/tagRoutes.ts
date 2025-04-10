import { Elysia, Context } from "elysia";
import { CreateTag } from "../types/types";
import tagService from "../services/TagService";
import { routeErrorHandler } from "../utils/errors";
export const tagRoutes = new Elysia();

tagRoutes.get("/tag", async (context) => {
  const res = await routeErrorHandler(context, () => tagService.getAll());
  return res;
});
tagRoutes.get("/tag/:id", async (context) => {
  const id = context.params.id;
  const res = await routeErrorHandler(context, () => tagService.getById(id));
  return res;
});

tagRoutes.delete("/tag/:id", async (context) => {
  const id = context.params.id;
  const res = await routeErrorHandler(context, () => tagService.delete(id));
  return res;
});
