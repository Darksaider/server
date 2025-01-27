import { Prisma } from "@prisma/client";
import { IRepository, IService, IUniversalService } from "../types/interfaces";
import { Filter } from "../types/types";
import { ValidationError, handleServiceError } from "../utils/errors";
import { ZodSchema, z } from "zod";

const createService = <
  T,
  CreateInput extends T = any,
  UpdateInput extends T = any,
  ModelName extends Prisma.ModelName = Prisma.ModelName,
>(
  repository: IRepository<T, CreateInput, UpdateInput, ModelName>,
): IUniversalService<T, CreateInput, UpdateInput, ModelName> => {
  return {
    repository,
    getAll: async (config): Promise<T[]> => {
      return await handleServiceError(
        () => repository.findMany(config),
        `Failed to get entities`,
      );
    },
    getById: async (id: number | string): Promise<T | null> => {
      return await handleServiceError(() => repository.findById(id), "");
    },
    create: async <Schema extends ZodSchema>(
      schema: Schema,
      item: unknown,
    ): Promise<T> => {
      try {
        const validatedItem = schema.parse(item) as CreateInput;
        return await handleServiceError(
          async () => await repository.create(validatedItem),
          "Failed to create entity",
        );
      } catch (error: any) {
        if (error instanceof z.ZodError) {
          throw new ValidationError(error.message);
        }
        throw error;
      }
    },
    update: async <Schema extends ZodSchema>(
      schema: Schema,
      id: number | string,
      item: unknown,
    ): Promise<T | null> => {
      try {
        const validatedItem = schema.parse(item) as UpdateInput;
        return await handleServiceError(
          async () => await repository.update(id, validatedItem),
          `Failed to update entity with id ${id}`,
        );
      } catch (error: any) {
        if (error instanceof z.ZodError) {
          throw new ValidationError(error.message);
        }
        throw error;
      }
    },
    delete: async (id: number | string): Promise<T> => {
      return await handleServiceError(
        async () => await repository.delete(id),
        `Failed to delete entity with id ${id}`,
      );
    },
  };
};

export default createService;
