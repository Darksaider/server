// user.service.ts
import { CreateDiscount, Discount } from "../types/types";
import { createDiscountSchema } from "../prisma/schemas";
import createService from "./baseService";
import discountRepository from "../prisma/repositories/discountRepository";
const discountService = createService<Discount>(discountRepository);
const createDiscount = async (data: CreateDiscount): Promise<Discount> => {
  return await discountService.create(createDiscountSchema, data);
};
const updateDiscount = async (id: number, data: CreateDiscount): Promise<Discount | null> => {
  const updateDiscountSchema = createDiscountSchema.partial()
  return await discountService.update(updateDiscountSchema, id, data);
};

export default {
  ...discountService,
  createDiscount,
  updateDiscount
};
