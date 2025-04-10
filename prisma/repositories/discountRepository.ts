import createRepository from "./baseRepository";
import { Discount, CreateDiscount } from "../../types/types";

const discountRepository = createRepository<Discount, CreateDiscount, {}, "discounts">(
  "discounts",
);

export default { ...discountRepository };
