import { Context } from "elysia";

export const sendResponse = (
  statusCode: number,
  success: boolean,
  message: string,
  data?: any,
  error?: any,
) => {
  return {
    success,
    message,
    data,
    error,
    statusCode,
  };
};
export const sendCopyResponse = (
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
