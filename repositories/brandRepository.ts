import createRepository from "./baseRepository";
import { Brand, CreateBrand } from "../types/types";

const brandRepository = createRepository<Brand, CreateBrand, {}, "brands">(
  "brands"
);

export default { ...brandRepository };
