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
  .get("/comments", async (context) => {
    const res = await routeErrorHandler(context, () =>
      commentService.getAllComments()
    );
    return res;
  })
  .post("/comments", async (context) => {
    const user = context.user;
    if (!user?.id) {
      return { error: "User not logged in" };
    }

    const data = context.body as Comment;

    const res = await routeErrorHandler(context, () =>
      commentService.commentAdd({ ...data, user_id: user.id })
    );

    return res;
  });
