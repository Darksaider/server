import { Elysia, Context, t } from "elysia";
import { routeErrorHandler } from "../utils/errors";
import productService from "../services/ProductService";
import { buildProductFilters, parseProductFilters } from "../utils/fnProducts";
export const productRoutes = new Elysia();
productRoutes.get("/product", async (context: Context) => {
  const url = new URL(context.request.url);
  const query = Object.fromEntries(url.searchParams.entries());
  const filter = parseProductFilters(query);
  const filter2 = buildProductFilters(filter);

  const res = await routeErrorHandler(
    context,
    async () => productService.getProductsNew(filter),
    // async () => productService.getProductsByNewFilter(filter2),
    201
  );
  return res;
});

// productRoutes.post("/products", async (context) => {
//   const { body } = context;
//   const res = await routeErrorHandler(
//     context,
//     async () =>
//     201
//   );
//   return res;
// });
// productRoutes.put("/products/:id", async (context) => {
//   const id = +context.params.id;
//   const data = context.body as CreateProductInput;
//   const res = await routeErrorHandler(
//     context,
//     async () => productService.updateProductWithRelations(id, data),
//     201
//   );
//   return res;
// });
productRoutes.get("/product/:id", async (context) => {
  const id = context.params.id;
  const res = await routeErrorHandler(context, () =>
    productService.getProductById(+id)
  );
  return res;
});

productRoutes.delete("/product/:id", async (context) => {
  const id = context.params.id;
  const res = await routeErrorHandler(context, () =>
    productService.deleteProduct(+id)
  );
  return res;
});
