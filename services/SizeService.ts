// user.service.ts
import { CreateSize, Size } from "../types/types";
import { createSizeSchema } from "../prisma/schemas";
import createService from "./baseService";
import sizeRepository from "../repositories/sizeRepository";
const sizeService = createService<Size>(sizeRepository);
const createSize = async (size: CreateSize): Promise<Size> => {
  return await sizeService.create(createSizeSchema, size);
};

export default {
  ...sizeService,
  createSize,
};
