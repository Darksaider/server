import Elysia from "elysia";
import jwtMiddleware from "../Middleware/JwtMiddleware";
import { routeErrorHandler } from "../utils/errors";
import commentService from "../services/CommentsService";
import { Comment } from "../types/types";

export const commentRoutes = new Elysia()
  .use(jwtMiddleware)
  .get("/comments/:productId", async (context) => {
    const res = await routeErrorHandler(context, () =>
      commentService.getCommentsByProductId(+context.params.productId)
    );
    return res;
  })
  .post("/comments", async (context) => {
    if (!context.user) {
      return "User unlogin";
    }
    const userId = context.user.id;
    const data = context.body as Comment;

    console.log({ user_id: userId, ...data });

    const res = await routeErrorHandler(context, () =>
      commentService.commentAdd({ user_id: userId, ...data })
    );
    return res;
  });
