import { Brand, Category, CreateBrand, CreateCategory } from "../types/types";
import createService from "./baseService";
import { createBrandSchema, createCategorySchema } from "../prisma/schemas";
import categoryRepository from "../prisma/repositories/categoryRepository";
const categoryService = createService(categoryRepository);

const createCategory = async (data: CreateCategory): Promise<Category> => {
  const res = categoryService.create(createCategorySchema, data)
  return res
};
const updateCategory = async (id: number, data: CreateCategory): Promise<Category | null> => {
  const updatedCategorySchema = createCategorySchema.partial()
  return await categoryService.update(updatedCategorySchema, id, data)
};



export default { createCategory, updateCategory, ...categoryService }; 
