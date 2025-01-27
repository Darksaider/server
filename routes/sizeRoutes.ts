import { Elysia, Context } from "elysia";
import { CreateSize } from "../types/types";
import sizeService from "../services/SizeService";
import { routeErrorHandler } from "../utils/errors";
export const sizeRoutes = new Elysia();

sizeRoutes.get("/sizes", async (context: Context) => {
  const urlParams = new URLSearchParams(context.request.url.split("?")[1]);
  const filter: any = {};

  for (const [key, value] of urlParams.entries()) {
    try {
      filter[key] = JSON.parse(value);
    } catch (e) {
      filter[key] = value;
    }
  }
  const res = await routeErrorHandler(context, () =>
    sizeService.getById(filter),
  );
  return res;
});
sizeRoutes.post("/sizes", async (context) => {
  const data = context.body as CreateSize;
  const res = await routeErrorHandler(
    context,
    async () => sizeService.createSize(data),
    201,
  );
  return res;
});

sizeRoutes.get("/sizes/:id", async (context) => {
  const id = context.params.id;
  const res = await routeErrorHandler(context, () => sizeService.getById(id));
  return res;
});

sizeRoutes.delete("/sizes/:id", async (context) => {
  const id = context.params.id;
  const res = await routeErrorHandler(context, () => sizeService.delete(id));
  return res;
});
