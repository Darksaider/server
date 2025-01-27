import { t } from "elysia";
import createRepository from "../repositories/baseRepository";
import brandRepository from "../repositories/brandRepository";
import { Brand, CreateBrand } from "../types/types";
import createService from "./baseService";
const brandService = createService(brandRepository);
const getBrands = async (): Promise<Brand[]> => {
  const brands = await brandRepository.findMany();
  return brands;
};
const createBrand = async (data: CreateBrand): Promise<Brand> => {
  try {
    const newBrand = await brandRepository.create(data);
    return newBrand;
  } catch (error: any) {
    throw new Error(`Failed to create brand: ${error.message}`);
  }
};
const deleteBrand = async (id: number): Promise<Brand | null> => {
  try {
    const deletedBrand = await brandRepository.delete(id);
    return deletedBrand;
  } catch (error) {
    console.error("Error deleting brand:", error);
    return null;
  }
};

export default { getBrands, createBrand, deleteBrand }; // 👈 Exporting the brandRepository methods along with the new method s
