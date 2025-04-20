// user.service.ts
import { Product } from "../types/types";
// Переконайтесь, що CreateProductInput тепер має product_photos: Array<{ photo_url: string }>
import { CreateProductInput } from "../prisma/schemas"; // Або ваш файл типів
import createService from "./baseService";
import productRepository from "../prisma/repositories/productRepository";
import { handleServiceError } from "../utils/errors";
import { FindManyConfig } from "../types/interfaces";
import { Prisma } from "@prisma/client";
import prismaDb from "../prisma/prisma";

const productService = createService<Product>(productRepository);

// Зберігаємо include для перевикористання
const productInclude = {
  product_discounts: { include: { discounts: true } },
  product_categories: { include: { categories: true } },
  product_brands: { include: { brands: true } },
  product_colors: { include: { colors: true } },
  product_photos: {
    // Прямий зв'язок з product_photos
    // orderBy: { position: 'asc' }, // Видалено сортування за позицією
    // Можна додати orderBy: { created_at: 'asc' }, якщо потрібен порядок додавання
  },
  product_sizes: { include: { sizes: true } },
  product_tags: { include: { tags: true } },
};

// --- Функції getProducts, getProductById, getProductsByNewFilter залишаються без змін ---
// Вони використовують оновлений productInclude
const getProducts = async (config: FindManyConfig<Product>) => {
  return await handleServiceError(
    () => productRepository.getProducts({ ...config, include: productInclude }),
    "Failed to get products"
  );
};

const getProductById = async (id: number) => {
  return await handleServiceError(
    () => productRepository.findById(id, { include: productInclude }),
    `Failed to get product by id ${id}`
  );
};

const getProductsByNewFilter = async (filter: any) => {
  return await handleServiceError(
    // Передаємо include, якщо метод його підтримує
    () => productRepository.getProductsByNewFilter(filter),
    "Failed to get products by filter"
  );
};
// --- Кінець функцій без змін ---

// Функція створення продукту зі зв'язками (БЕЗ position)
async function createProductWithRelations(
  data: CreateProductInput // Очікує product_photos: Array<{ photo_url: string }>
): Promise<Prisma.productsGetPayload<{ include: typeof productInclude }>> {
  const {
    name,
    description,
    price,
    stock,
    sales_count,
    product_brands,
    product_categories,
    product_colors,
    product_sizes,
    product_tags,
    product_photos, // Масив об'єктів [{ photo_url: string }]
    // product_discounts
  } = data;

  // Готуємо дані для створення записів у product_photos, витягуючи тільки photo_url
  const photosToCreate = (Array.isArray(product_photos) ? product_photos : [])
    .filter(
      (p) => p && typeof p.photo_url === "string" && p.photo_url.trim() !== ""
    ) // Фільтруємо невалідні
    .map((p) => ({
      photo_url: p.photo_url,
    }));

  return await prismaDb.$transaction(async (tx) => {
    const createdProduct = await tx.products.create({
      data: {
        name,
        description: description,
        price,
        stock: stock ?? 0,
        sales_count: sales_count ?? 0,
        product_brands: { create: { brand_id: product_brands } },
        product_categories: {
          create: product_categories.map((id) => ({ category_id: id })),
        },
        product_colors: {
          create: product_colors.map((id) => ({ color_id: id })),
        },
        product_sizes: { create: product_sizes.map((id) => ({ size_id: id })) },
        ...(product_tags &&
          product_tags.length > 0 && {
            product_tags: {
              create: product_tags.map((id) => ({ tag_id: id })),
            },
          }),
        ...(photosToCreate.length > 0 && {
          product_photos: {
            create: photosToCreate, // Передаємо масив об'єктів { photo_url: string }
          },
        }),
      },
      include: productInclude,
    });
    return createdProduct;
  });
}

// Функція оновлення продукту зі зв'язками (БЕЗ position)
async function updateProductWithRelations(
  productId: number,
  data: CreateProductInput // Очікує product_photos: Array<{ photo_url: string }>
): Promise<Prisma.productsGetPayload<{
  include: typeof productInclude;
}> | null> {
  const {
    name,
    description,
    price,
    stock,
    sales_count,
    product_brands,
    product_categories,
    product_colors,
    product_sizes,
    product_tags,
    product_photos, // Масив об'єктів [{ photo_url: string }]
    // product_discounts
  } = data;

  // Готуємо дані для нових записів у product_photos (тільки photo_url)
  const photosToCreate = (Array.isArray(product_photos) ? product_photos : [])
    .filter(
      (p) => p && typeof p.photo_url === "string" && p.photo_url.trim() !== ""
    )
    .map((p) => ({
      photo_url: p.photo_url,
    }));

  try {
    const updatedProduct = await prismaDb.$transaction(async (tx) => {
      const product = await tx.products.update({
        where: { id: productId },
        data: {
          name,
          description: description ?? undefined,
          price,
          stock: stock ?? 0,
          sales_count: sales_count ?? 0,
          updated_at: new Date(),

          // Оновлення інших зв'язків (без змін)
          product_brands: {
            deleteMany: {},
            create: { brand_id: product_brands },
          },
          product_categories: {
            deleteMany: {},
            create: product_categories.map((id) => ({ category_id: id })),
          },
          product_colors: {
            deleteMany: {},
            create: product_colors.map((id) => ({ color_id: id })),
          },
          product_sizes: {
            deleteMany: {},
            create: product_sizes.map((id) => ({ size_id: id })),
          },
          product_tags: {
            deleteMany: {},
            ...(product_tags &&
              product_tags.length > 0 && {
                create: product_tags.map((id) => ({ tag_id: id })),
              }),
          },

          // --- Оновлення записів product_photos (БЕЗ position) ---
          product_photos: {
            deleteMany: {}, // Видалити старі
            ...(photosToCreate.length > 0 && {
              // Створити нові
              create: photosToCreate, // Передаємо масив об'єктів { photo_url: string }
            }),
          },
          // Додайте оновлення product_discounts тут аналогічно, якщо потрібно
        },
        include: productInclude,
      });
      return product;
    });
    return updatedProduct;
  } catch (error) {
    // Обробка помилок залишається такою ж
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        console.warn(
          `Update failed: Product with ID ${productId} not found or related record missing.`
        );
        return null;
      }
      console.error(
        `Prisma Error [${error.code}] updating product ${productId}: ${error.message}`
      );
    } else {
      console.error(`Error updating product ${productId}:`, error);
    }
    throw new Error(`Failed to update product ${productId}`);
  }
}

export default {
  ...productService,
  getProducts,
  getProductById,
  getProductsByNewFilter,
  createProductWithRelations,
  updateProductWithRelations,
};

// Нагадування про очікуваний інтерфейс/тип (без position)
