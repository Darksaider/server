import commentRepository from "../repositories/commentRepository";
import { Comment } from "../types/types";

const commentAdd = async (comment: Comment): Promise<Comment> => {
  try {
    const res = await commentRepository.commentAdd(comment);
    return res;
  } catch (error) {
    console.error("Error adding comment:", error);
    throw new Error("Failed to add comment");
  }
};
const deleteComment = async (id: number): Promise<Comment> => {
  try {
    const deletedComment = await commentRepository.deleteComment(id);
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
    const comments = await commentRepository.getCommentsByProductId(productId);
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
    const updatedComment = await commentRepository.updateComment(id, comment);
    return updatedComment;
  } catch (error) {
    console.error("Error updating comment:", error);
    throw new Error("Failed to update comment");
  }
};

export default {
  updateComment,
  deleteComment,
  getCommentsByProductId,
  commentAdd,
};
