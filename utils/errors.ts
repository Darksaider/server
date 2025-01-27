// utils/errors.ts
import { Context } from "elysia";
import { sendCopyResponse } from "./response";

export class RepositoryError extends Error {
  constructor(
    message: string,
    public originalError?: any,
    public statusCode: number = 500,
  ) {
    super(message);
    this.name = "RepositoryError";
  }
}

export class ValidationError extends Error {
  constructor(messages: string[] | string) {
    super(Array.isArray(messages) ? messages.join(", ") : messages);
    this.name = "ValidationError";
    this.statusCode = 400;
  }
  public statusCode: number = 400;
}

export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NotFoundError";
    this.statusCode = 404;
  }
  public statusCode: number = 404;
}

export class ServiceError extends Error {
  constructor(
    message: string,
    public details?: any,
  ) {
    super(message);
    this.name = "ServiceError";
    this.statusCode = 500;
  }
  public statusCode: number = 500;
}

export const handleServiceError = async <T>(
  action: () => Promise<T>,
  errorMessage: string,
): Promise<T> => {
  try {
    const result = await action();

    if (!result || (Array.isArray(result) && result.length === 0)) {
      throw new NotFoundError(errorMessage);
    }
    return result;
  } catch (error: unknown) {
    if (error instanceof NotFoundError || error instanceof ValidationError) {
      throw error;
    } else if (error instanceof RepositoryError) {
      console.error("Помилка RepositoryError в handleServiceError:", error);
      throw new ServiceError(`${errorMessage}: ${error.message}`, error);
    } else if (error instanceof Error) {
      console.error("Невідома помилка в handleServiceError:", error);
      throw new ServiceError(`${errorMessage}: ${error.message}`, error);
    } else {
      console.error("Невідома помилка в handleServiceError:", error);
      throw new ServiceError(errorMessage + ": unknown error");
    }
  }
};

export const routeErrorHandler = async <T>(
  context: Context,
  fn: () => Promise<T>,
  successStatus: number = 200,
) => {
  try {
    const data = await fn();
    return sendCopyResponse(context, successStatus, true, "Успіх", data);
  } catch (error: unknown) {
    let statusCode = 500;
    let errorMessage = "Внутрішня помилка сервера";

    if (error instanceof Error) {
      if (error.name === "NotFoundError") {
        statusCode = (error as NotFoundError).statusCode;
        errorMessage = error.message;
      } else if (error.name === "ValidationError") {
        statusCode = (error as ValidationError).statusCode;
        errorMessage = error.message;
      } else if (error.name === "ServiceError") {
        statusCode = (error as ServiceError).statusCode;
        errorMessage = error.message;
      } else {
        console.error("Невідома помилка:", error);
        errorMessage = error.message;
      }
    }

    return sendCopyResponse(
      context,
      statusCode,
      false,
      errorMessage,
      null,
      error,
    );
  }
};
