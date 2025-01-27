import { Prisma } from "@prisma/client";
import { Filter } from "./types";
import { ZodSchema } from "zod";

export interface IRepository<
  T,
  CreateInput = any,
  UpdateInput = any,
  ModelName extends Prisma.ModelName = Prisma.ModelName,
> {
  modelName: ModelName;
  create(data: CreateInput): Promise<T>;
  findById(id: number | string, config?: FindManyConfig<T>): Promise<T | null>;
  findMany(
    config?: FindManyConfig<T>,
    orderBy?: Prisma.Enumerable<Prisma.SortOrder>,
    skip?: number,
    take?: number,
  ): Promise<T[]>;
  update(id: number | string, data: UpdateInput): Promise<T>;
  delete(id: number | string): Promise<T>;
  count(filter?: Filter<T>): Promise<number>;
}

export interface IService<T> {
  getAll(config: FindManyConfig<T>): Promise<T[]>;
  getById(id: number | string): Promise<T | null>;
  create<Schema extends ZodSchema>(schema: Schema, item: unknown): Promise<T>;
  update<Schema extends ZodSchema>(
    schema: Schema,
    id: number | string,
    item: unknown,
  ): Promise<T | null>;
  delete(id: number | string): Promise<T>;
}

export interface IUniversalService<
  T,
  CreateInput extends T = any,
  UpdateInput extends T = any,
  ModelName extends Prisma.ModelName = Prisma.ModelName,
> extends IService<T> {
  repository: IRepository<T, CreateInput, UpdateInput, ModelName>;
}
export interface FindManyConfig<T> {
  filter?: Filter<T>;
  orderBy?: Prisma.Enumerable<Prisma.SortOrder>;
  skip?: number;
  take?: number;
  include?: any;
  customWhere?: any;
}
