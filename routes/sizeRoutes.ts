import { Elysia, Context } from "elysia";
import { CreateSize } from "../types/types";
import sizeService from "../services/SizeService";
import { routeErrorHandler } from "../utils/errors";
import { createSizeSchema } from "../prisma/schemas";
export const sizeRoutes = new Elysia();

sizeRoutes.get("/sizes", async (context: Context) => {
  const res = await routeErrorHandler(context, () => sizeService.getAll());
  return res;
});
sizeRoutes.post("/sizes", async (context) => {
  const data = context.body as CreateSize;
  const res = await routeErrorHandler(
    context,
    async () => sizeService.createSize(data),
    201
  );
  return res;
});

sizeRoutes.put("/sizes/:id", async (context) => {
  const id = context.params.id;
  const data = context.body;
  const res = await routeErrorHandler(context, () =>
    sizeService.update(createSizeSchema, id, data)
  );
  return res;
});

sizeRoutes.delete("/sizes/:id", async (context) => {
  const id = context.params.id;
  const res = await routeErrorHandler(context, () => sizeService.delete(id));
  return res;
});
