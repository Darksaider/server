// src/routes/favorites.routes.ts
import { Elysia, t } from "elysia";
import jwtAuth from "../Middleware/JwtMiddleware";
import { CreateCart, Cart } from "../types/types";
import { cartService } from "../services/CardService";

export const cartRoutes = new Elysia()
  .use(jwtAuth)
  .get("cart", async ({ user }) => {
    if (!user?.id) {
      throw new Error("Authentication required");
    }
    const favorites = await cartService.getUserCart(user?.id);
    return { data: favorites };
  })
  .post("cart", async (context) => {
    const { body, user, set } = context;
    if (!user?.id) throw new Error("Authentication required");
    const data = body as CreateCart;

    if (!data.product_id) throw new Error("Product ID is required");
    // Явно задаємо тип для body
    const result = await cartService.addUserCart(user.id, data);

    if (result === null) {
      set.status = 200;
      return { message: `Product ${+data.product_id} is already in cart.` };
    }

    set.status = 201; // Created
    return {
      message: "Product added to favorites successfully!",
      favorite: result,
    };
  })
  .delete("cart/:id", async ({ user, params, set }) => {
    if (!user?.id) throw new Error("Authentication required");

    const { id } = params;
    await cartService.removeFavorite(user.id, +id);

    set.status = 204;
    return "Delete Successful";
  });
