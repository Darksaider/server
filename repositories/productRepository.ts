import { config } from "googleapis/build/src/apis/config";
import prismaDb from "../bd/prisma/prisma";
import { FindManyConfig } from "../types/interfaces";
import { CreateProduct, Product, UpdateProduct } from "../types/types";
import { RepositoryError } from "../utils/errors";
import createRepository from "./baseRepository";
const productRepository = createRepository<
  Product,
  CreateProduct,
  UpdateProduct,
  "products"
>("products");

const getProducts = async (config: FindManyConfig<Product>) => {
  console.log("Config.include", config.include);

  try {
    const products = await productRepository.findMany({
      ...config,
    });
    return products;
  } catch (error) {
    throw new RepositoryError(`Failed to find many product `);
  }
};
const findProductById = async (id: number, config: FindManyConfig<Product>) => {
  try {
    const products = await productRepository.findById(id, { ...config });
    console.log("findProductById", products);

    return products;
  } catch (error) {
    throw new RepositoryError(`Failed to find products with id:${id}`);
  }
};

export default { getProducts, findProductById, ...productRepository };
