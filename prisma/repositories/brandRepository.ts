import createRepository from "./baseRepository";
import { Brand, CreateBrand } from "../../types/types";
import { t } from "elysia";

const brandRepository = createRepository<Brand, CreateBrand, {}, "brands">(
  "brands",
);

export default { ...brandRepository };
