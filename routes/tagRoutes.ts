import { Elysia } from "elysia";
import { CreateTag } from "../types/types";
import tagService from "../services/TagService";
import { routeErrorHandler } from "../utils/errors";
export const tagRoutes = new Elysia();

tagRoutes.get("/tags", async (context) => {
  const res = await routeErrorHandler(context, () => tagService.getAll());
  return res;
});
tagRoutes.post("/tags", async (context) => {
  const res = await routeErrorHandler(
    context,
    async () => tagService.createTag(context.body as CreateTag),
    201
  );
  return res;
});

tagRoutes.delete("/tags/:id", async (context) => {
  const id = context.params.id;
  const res = await routeErrorHandler(context, () => tagService.delete(id));
  return res;
});
