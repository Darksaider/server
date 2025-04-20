import prismaDb from "../prisma";
import { FindManyConfig } from "../../types/interfaces";
import { CreateProduct, Product, UpdateProduct } from "../../types/types";
import { RepositoryError } from "../../utils/errors";
import createRepository from "./baseRepository";
const productRepository = createRepository<
  Product,
  CreateProduct,
  UpdateProduct,
  "products"
>("products");

const getProducts = async (config: FindManyConfig<Product>) => {
  try {
    const products = await productRepository.findMany({
      ...config,
    });
    return products;
  } catch (error) {
    throw new RepositoryError(`Failed to find many product `);
  }
};

const getProductsByNewFilter = async (filter: any) => {
  try {
    const products = await prismaDb.products.findMany(filter);
    const productsCourt = await prismaDb.products.count({
      where: {
        ...filter.where,
      },
    });
    return { products, productsCourt };
  } catch (error) {
    throw new RepositoryError("Не вдалося отримати продукти", error);
  }
};

export default { getProducts, ...productRepository, getProductsByNewFilter };
