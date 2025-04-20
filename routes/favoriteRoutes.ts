// src/routes/favorites.routes.ts
import { Elysia, t } from "elysia";
import { favoritesService } from "../services/FavoriteService";
import jwtAuth from "../Middleware/JwtMiddleware";
import { Favorite } from "../types/types";
import { routeErrorHandler } from "../utils/errors";

export const favoritesRoutes = new Elysia()
  .use(jwtAuth)
  .get("favorites", async (context) => {
    const { user } = context;
    if (!user?.id) {
      throw new Error("Authentication required");
    }
    const res = await routeErrorHandler(context, () =>
      favoritesService.getUserFavorites(user?.id)
    );
    return res; // Повертаємо дані
  })
  .post("favorites", async (context) => {
    const { body, user, set } = context;
    if (!user?.id) throw new Error("Authentication required");

    const { id } = body as { id: number }; // Явно задаємо тип для body
    const result = await favoritesService.addFavorite(user.id, +id);

    if (result === null) {
      set.status = 200; // OK, але нічого не створено (або 409 Conflict)
      return { message: `Product ${+id} is already in favorites.` };
    }

    set.status = 201; // Created
    return {
      message: "Product added to favorites successfully!",
      favorite: result,
    };
  })
  .delete("favorites/:id", async ({ user, params, set }) => {
    if (!user?.id) throw new Error("Authentication required");

    const { id } = params; // ID вже буде числом завдяки схемі
    await favoritesService.removeFavorite(user.id, +id);

    set.status = 204;
    return; // Або можна повернути 200 OK з повідомленням
  });
