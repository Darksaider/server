// src/modules/products/product.service.ts
import { Prisma } from "@prisma/client";
import prismaDb from "../prisma/prisma"; // Припускаємо, що цей шлях правильний
// Припускаємо, що CreateProductInput визначає product_brands як number або string, а не масив
import { CreateProductInput } from "../prisma/schemas";

// Функція створення (з виправленням для одного бренду, як у вашому коді)
async function createProductWithRelations(data: CreateProductInput) {
  const {
    name,
    description,
    price,
    stock,
    sales_count,
    product_brands, // Одне значення ID бренду
    product_categories,
    product_colors,
    product_sizes,
    product_tags,
    // product_photos,
    // product_discounts
  } = data;

  const newProduct = await prismaDb.$transaction(async (tx) => {
    const createdProduct = await tx.products.create({
      data: {
        name,
        description: description ?? undefined,
        price,
        stock: stock ?? 0,
        sales_count: sales_count ?? 0,
        product_brands: {
          // Створюємо один запис у проміжній таблиці
          create: { brand_id: product_brands },
        },
        product_categories: {
          create: product_categories.map(categoryId => ({ category_id: categoryId })),
        },
        product_colors: {
          create: product_colors.map(colorId => ({ color_id: colorId })),
        },
        product_sizes: {
          create: product_sizes.map(sizeId => ({ size_id: sizeId })),
        },
        ...(product_tags && product_tags.length > 0 && {
          product_tags: {
            create: product_tags.map(tagId => ({ tag_id: tagId })),
          },
        }),
        // ... product_photos, product_discounts ...
      },
    });
    return createdProduct;
  });
  return newProduct;
}

// Функція оновлення з ВИПРАВЛЕНИМ блоком product_brands
async function updateProductWithRelations(productId: number, data: CreateProductInput) {
  const {
    name,
    description,
    price,
    stock,
    sales_count,
    product_brands, // Одне значення ID бренду
    product_categories,
    product_colors,
    product_sizes,
    product_tags,
    // product_photos,
    // product_discounts
  } = data;

  try {
    const updatedProduct = await prismaDb.products.update({
      where: { id: productId },
      data: {
        name,
        description: description ?? undefined,
        price,
        stock: stock ?? 0,
        sales_count: sales_count ?? 0,
        updated_at: new Date(),

        product_brands: {
          deleteMany: {}, // Видаляємо ВСІ попередні зв'язки з брендами для цього продукту
          // --- ВИПРАВЛЕНО ---
          // Створюємо ОДИН новий зв'язок з брендом, використовуючи наданий ID
          create: {
            brand_id: product_brands,
          },
          // -------------------
        },
        product_categories: {
          deleteMany: {},
          create: product_categories.map(categoryId => ({
            category_id: categoryId,
          })),
        },
        product_colors: {
          deleteMany: {},
          create: product_colors.map(colorId => ({
            color_id: colorId,
          })),
        },
        product_sizes: {
          deleteMany: {},
          create: product_sizes.map(sizeId => ({
            size_id: sizeId,
          })),
        },
        ...(product_tags !== undefined && {
          product_tags: {
            deleteMany: {},
            create: (product_tags || []).map(tagId => ({
              tag_id: tagId,
            })),
          }
        }),
        // ... product_photos, product_discounts ...
      },
      // include: { ... } // Опціонально
    });
    return updatedProduct;

  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      console.warn(`Update failed: Product with ID ${productId} not found.`);
      return null;
    }
    console.error(`Error updating product ${productId}:`, error);
    throw error;
  }
}

// Не забуваємо експортувати оновлену функцію
export const productService = {
  createProductWithRelations,
  updateProductWithRelations, // Додаємо функцію оновлення до експорту
  // ... інші методи сервісу
};