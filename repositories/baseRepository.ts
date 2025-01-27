import { PrismaClient, Prisma } from "@prisma/client";
import prismaDb from "../bd/prisma/prisma";
import { Filter } from "../types/types";
import { FindManyConfig, IRepository } from "../types/interfaces";
import { NotFoundError, RepositoryError } from "../utils/errors";

function createRepository<
  T,
  CreateInput,
  UpdateInput,
  ModelName extends Prisma.ModelName,
>(modelName: ModelName): IRepository<T, CreateInput, UpdateInput, ModelName> {
  type Model = PrismaClient[ModelName] extends {
    create: (args: any) => Promise<infer U>;
  }
    ? U
    : never;

  return {
    modelName,
    async create(data: CreateInput): Promise<T> {
      try {
        return await (prismaDb[modelName] as any).create({ data });
      } catch (error: any) {
        throw new RepositoryError(`Failed to create ${modelName}`, error);
      }
    },

    async findById(id: number, config?: FindManyConfig<T>): Promise<T | null> {
      try {
        console.log("id", config?.include);

        const res = await (prismaDb[modelName] as any).findUnique({
          where: { id: Number(id) },
          include: config?.include,
        });
        return res;
      } catch (error: any) {
        throw new RepositoryError(
          `Failed to find ${modelName} by ID ${id}`,
          error,
        );
      }
    },

    async findMany(config?: FindManyConfig<T>): Promise<T[]> {
      try {
        const res = await (prismaDb[modelName] as any).findMany({
          where: config?.filter,
          include: config?.include,
          orderBy: config?.orderBy,
          skip: config?.skip,
          take: config?.take,
        });
        if (!res) {
          throw new NotFoundError(`Data for ${modelName} not found`);
        }
        return res;
      } catch (error: any) {
        throw new RepositoryError(`Failed to find many ${modelName}`, error);
      }
    },

    async update(id: number | string, data: UpdateInput): Promise<T> {
      try {
        return await (prismaDb[modelName] as any).update({
          where: { id: Number(id) },
          data,
        });
      } catch (error: any) {
        throw new RepositoryError(
          `Failed to update ${modelName} with ID ${id}`,
          error,
        );
      }
    },

    async delete(id: number | string): Promise<T> {
      try {
        return await (prismaDb[modelName] as any).delete({
          where: { id: Number(id) },
        });
      } catch (error: any) {
        throw new RepositoryError(
          `Failed to delete ${modelName} with ID ${id}`,
          error,
        );
      }
    },
    async count(filter?: Filter<T>): Promise<number> {
      try {
        return await (prismaDb[modelName] as any).count({ where: filter });
      } catch (error: any) {
        throw new RepositoryError(`Failed to count ${modelName}`, error);
      }
    },
  };
}

export default createRepository;
