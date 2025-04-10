import { Elysia, Context } from "elysia";
import { CreateDiscount } from "../types/types";
import { routeErrorHandler } from "../utils/errors";
import discountService from "../services/DiscountService";
export const discountRoutes = new Elysia();

discountRoutes.get("/discount", async (context) => {
  const res = await routeErrorHandler(context, () =>
    discountService.getAll(),
  );
  return res;
});
discountRoutes.post("/discount", async (context) => {
  const data = context.body as CreateDiscount;
  const res = await routeErrorHandler(
    context,
    async () => discountService.createDiscount(data),
    201,
  );
  return res;
});
discountRoutes.put("/discount/:id", async (context) => {
  const data = context.body as CreateDiscount;
  const params = context.params.id;
  const res = await routeErrorHandler(
    context,
    async () => discountService.updateDiscount(+params, data),
    201,
  );
  return res;
});

discountRoutes.get("/discount/:id", async (context) => {
  const id = context.params.id;
  const data = context.body as CreateDiscount;
  const res = await routeErrorHandler(context, () => discountService.updateDiscount(+id, data));
  return res;
});

discountRoutes.delete("/discount/:id", async (context) => {
  const id = context.params.id;
  const res = await routeErrorHandler(context, () => discountService.delete(id));
  return res;
});
