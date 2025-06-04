import prismaDb from "../prisma/prisma";
import { Comment } from "../types/types";

const commentAdd = async (comment: Comment): Promise<Comment> => {
  try {
    console.log("comment", comment);

    const newComment = await prismaDb.comments.create({
      data: {
        user_id: comment.user_id,
        product_id: comment.product_id,
        text: comment.text,
        rating: comment.rating,
      },
    });
    return newComment;
  } catch (error) {
    console.error("Error adding comment:", error);
    throw new Error("Failed to add comment");
  }
};
const deleteComment = async (id: number): Promise<Comment> => {
  try {
    const deletedComment = await prismaDb.comments.delete({
      where: { id },
    });
    return deletedComment;
  } catch (error) {
    console.error("Error deleting comment:", error);
    throw new Error("Failed to delete comment");
  }
};
const getCommentsByProductId = async (
  productId: number
): Promise<Comment[]> => {
  try {
    const comments = await prismaDb.comments.findMany({
      where: { product_id: productId },
      include: {
        user: {
          select: {
            id: true,
            first_name: true,
            email: true,
            avatar_url: true,
          },
        },
      },
    });
    return comments;
  } catch (error) {
    console.error("Error fetching comments:", error);
    throw new Error("Failed to fetch comments");
  }
};
const updateComment = async (
  id: number,
  comment: Comment
): Promise<Comment> => {
  try {
    const updatedComment = await prismaDb.comments.update({
      where: { id },
      data: {
        text: comment.text,
        rating: comment.rating,
      },
    });
    return updatedComment;
  } catch (error) {
    console.error("Error updating comment:", error);
    throw new Error("Failed to update comment");
  }
};
export default {
  commentAdd,
  deleteComment,
  getCommentsByProductId,
  updateComment,
};
