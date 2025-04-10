import createRepository from "./baseRepository";
import { Category, CreateCategory } from "../../types/types";

const categoryRepository = createRepository<Category, CreateCategory, {}, "categories">(
  "categories",
);

export default { ...categoryRepository };
