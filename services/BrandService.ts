import brandRepository from "../prisma/repositories/brandRepository";
import { Brand, CreateBrand } from "../types/types";
import createService from "./baseService";
import { createBrandSchema } from "../prisma/schemas";
const brandService = createService(brandRepository);

const createBrand = async (data: CreateBrand): Promise<Brand> => {
  const res = brandService.create(createBrandSchema, data)
  return res
};
const updateBrand = async (id: number, data: CreateBrand): Promise<Brand | null> => {
  const updatedBrandSchema = createBrandSchema.partial()
  return await brandService.update(updatedBrandSchema, id, data)
};



export default { updateBrand, createBrand, ...brandService }; 
