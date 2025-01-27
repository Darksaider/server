// user.service.ts
import { CreateProduct, Product } from "../types/types";
import { createProductSchema } from "../bd/prisma/schemas";
import createService from "./baseService";
import productRepository from "../repositories/productRepository";
import { handleServiceError } from "../utils/errors";
import { FindManyConfig } from "../types/interfaces";
import prismaDb from "../bd/prisma/prisma";
const productService = createService<Product>(productRepository);
const productInclude = {
  product_discounts: {
    include: {
      discounts: true,
    },
  },
  product_categories: {
    include: {
      categories: true,
    },
  },
  product_brands: {
    include: {
      brands: true,
    },
  },
  product_colors: {
    include: {
      colors: true,
    },
  },
  product_photos: true,
  product_sizes: {
    include: {
      sizes: true,
    },
  },
  product_tags: {
    include: {
      tags: true,
    },
  },
};

const createProduct = async (product: CreateProduct): Promise<Product> => {
  return await productService.create(createProductSchema, product);
};
const getProducts = async (config: FindManyConfig<Product>) => {
  return await handleServiceError(
    () => productRepository.getProducts({ ...config, include: productInclude }),
    "Failed to get product",
  );
};

const getProductById = async (id: number) => {
  return await handleServiceError(
    () => productRepository.findProductById(id, { include: productInclude }),
    ``,
  );
};

export default {
  ...productService,
  createProduct,
  getProducts,
  getProductById,
};
