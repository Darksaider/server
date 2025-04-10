import { Context } from "elysia";


export const sendResponse = (
  context: Context,
  statusCode: number,
  success: boolean,
  message: string,
  data?: any,
  error?: any,
) => {
  context.set.status = statusCode;
  return {
    success,
    message,
    data,
    error,
  };
};
