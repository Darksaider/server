import { Elysia, Context } from "elysia";
import { CreateTag } from "../types/types";
import tagService from "../services/TagService";
import { routeErrorHandler } from "../utils/errors";
export const tagRoutes = new Elysia();

tagRoutes.get("/tag", async (context: Context) => {
  const urlParams = new URLSearchParams(context.request.url.split("?")[1]);
  const filter: any = {};

  for (const [key, value] of urlParams.entries()) {
    try {
      filter[key] = JSON.parse(value);
    } catch (e) {
      filter[key] = value;
    }
  }
  const res = await routeErrorHandler(context, () => tagService.getAll(filter));
  return res;
});
tagRoutes.post("/tag", async (context) => {
  const res = await routeErrorHandler(
    context,
    async () => tagService.createTag(context.body as CreateTag),
    201,
  );
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
