// user.service.ts
import { Color, CreateDiscount, Discount } from "../types/types";
import { createDiscountSchema } from "../prisma/schemas";
import createService from "./baseService";
import colorRepository from "../repositories/colorRepository";
const colorService = createService<Color>(colorRepository);

export default {
  ...colorService,
};
