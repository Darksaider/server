import Elysia from "elysia";
import brandService from "../services/BrandService";
import { CreateBrand } from "../types/types";
import { routeErrorHandler } from "../utils/errors";
import jwtMiddleware from "../Middleware/JwtMiddleware";
export const brandRoutes = new Elysia()
  .use(jwtMiddleware)
  .get("/brands", async (context) => {
    const res = await routeErrorHandler(context, () =>
      brandService.getAll(),
    );
    return res;

  })
  .post("/brands", async (context) => {
    const { hasRole, set } = context
    if (!hasRole("admin")) {
      set.status = 403;
      return { message: "Відмовлено у доступі" };
    }
    const data = context.body as CreateBrand
    const res = await routeErrorHandler(context, () =>
      brandService.createBrand(data),
    );
    return res;
  });
brandRoutes.put("/brands/:id", async (context) => {
  const { set, hasRole } = context
  if (!hasRole("admin")) {
    set.status = 403;
    return { message: "Відмовлено у доступі" };
  }
  const data = context.body as CreateBrand
  const params = context.params

  const res = await routeErrorHandler(context, () =>
    brandService.updateBrand(+params, data),
  );
  return res;
});
brandRoutes.delete("/brands/:id", async (context) => {
  const { set, hasRole } = context
  if (!hasRole("admin")) {
    set.status = 403;
    return { message: "Відмовлено у доступі" };
  }
  const data = context.body as CreateBrand
  const params = context.params

  const res = await routeErrorHandler(context, () =>
    brandService.delete(+params),
  );
  return res;
});
