import { Elysia, Context, t } from "elysia";
import {
  CreateProduct,
  ProductWithRelations,
} from "../types/types";
import { routeErrorHandler } from "../utils/errors";
import ProductService from "../services/ProductService";
import { buildProductFilters, parseProductFilters } from "../utils/fnProducts";
export const productRoutes = new Elysia();
productRoutes.get("/product", async (context: Context) => {
  const url = new URL(context.request.url);
  const query = Object.fromEntries(url.searchParams.entries());
  const filter = parseProductFilters(query);
  const filter2 = buildProductFilters(filter)

  const res = await routeErrorHandler(
    context,
    async () => ProductService.getProductsByNewFilter(
      filter2
    ),
    201,
  );
  return res
});


productRoutes.post("/product", async (context) => {
  const data = context.body as CreateProduct;
  const res = await routeErrorHandler(
    context,
    async () => ProductService.createProduct(data),
    201,
  );
  return res;
});

productRoutes.get("/product/:id", async (context) => {
  const id = context.params.id;
  const res = await routeErrorHandler(context, () =>
    ProductService.getProductById(+id),
  );
  return res;
});

productRoutes.delete("/product/:id", async (context) => {
  const id = context.params.id;
  const res = await routeErrorHandler(context, () => ProductService.delete(id));
  return res;
});

