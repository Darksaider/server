import { Elysia, Context, t } from "elysia";
import {
  CreateProduct,
  Product,
  ProductFilter,
  ProductWithRelations,
} from "../types/types";
import { routeErrorHandler } from "../utils/errors";
import ProductService from "../services/ProductService";
import { FindManyConfig } from "../types/interfaces";
import { parsePrismaQuery } from "../utils/fn";
export const productRoutes = new Elysia();

productRoutes.get("/product", async (context: Context) => {
  const urlParams = new URLSearchParams(
    context.request.url.split("?")[1] || "",
  );
  const queryString = urlParams.toString();
  let filter = {};
  console.log(11);


  if (queryString) filter = parsePrismaQuery(queryString);
  const config: FindManyConfig<Product> = {
    filter: filter as ProductFilter,
  };
  const res = await routeErrorHandler(context, async () => {
    const products = (await ProductService.getProducts(
      config,
    )) as ProductWithRelations[];
    return products;
  });
  // return filter2
  return res;
});

productRoutes.get("/getUUU", async (context: Context) => {
  const result = parsePrismaQuery(context.request.url.split("?")[1]);
  return result;
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
