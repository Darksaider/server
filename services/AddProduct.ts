// src/modules/products/product.service.ts
import { Prisma } from "@prisma/client";
import prismaDb from "../prisma/prisma";

// Допоміжний інтерфейс для структури фото
interface ProductPhotoInput {
  photo_url: string;
  cloudinary_public_id: string;
}

// Оновлений інтерфейс для вхідних даних
interface CreateProductInput {
  name: string;
  description?: string | null;
  price: Prisma.Decimal | number;
  stock?: number | null;
  sales_count?: number | null;
  product_brands: number;
  product_categories: number[];
  product_colors: number[];
  product_sizes: number[];
  product_tags?: number[] | null;
  product_discounts?: number; // ID знижок для застосування до продукту
  product_photos?: ProductPhotoInput[] | null; // Для створення продукту
  new_product_photos?: ProductPhotoInput[] | null; // Для оновлення - нові фото
  photos_to_delete?: string[] | null; // Для оновлення - ID фото для видалення
}

// Функція створення продукту
async function createProductWithRelations(data: CreateProductInput) {
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
    product_photos,
    product_discounts,
  } = data;

  // Підготовка фото для створення
  const photosToCreate = (Array.isArray(product_photos) ? product_photos : [])
    .filter(
      (p): p is ProductPhotoInput =>
        p &&
        typeof p.photo_url === "string" &&
        p.photo_url.trim() !== "" &&
        typeof p.cloudinary_public_id === "string" &&
        p.cloudinary_public_id.trim() !== ""
    )
    .map((p) => ({
      photo_url: p.photo_url,
      cloudinary_public_id: p.cloudinary_public_id,
    }));
  console.log("prodct", product_discounts);

  // Створення продукту в транзакції
  const newProduct = await prismaDb.$transaction(async (tx) => {
    const createdProduct = await tx.products.create({
      data: {
        name,
        description: description ?? undefined,
        price,
        stock: stock ?? 0,
        sales_count: sales_count ?? 0,
        // Зв'язок з брендом
        product_brands: {
          create: { brand_id: product_brands },
        },
        // Зв'язки багато-до-багатьох
        product_categories: {
          create: product_categories.map((categoryId) => ({
            category_id: categoryId,
          })),
        },
        product_colors: {
          create: product_colors.map((colorId) => ({ color_id: colorId })),
        },
        product_sizes: {
          create: product_sizes.map((sizeId) => ({ size_id: sizeId })),
        },
        // Умовне додавання тегів
        ...(product_tags &&
          product_tags.length > 0 && {
            product_tags: {
              create: product_tags.map((tagId) => ({ tag_id: tagId })),
            },
          }),
        // Додавання фото
        ...(photosToCreate.length > 0 && {
          product_photos: {
            create: photosToCreate,
          },
        }),
        // Умовне додавання знижки
        ...(product_discounts !== undefined &&
          product_discounts !== null && {
            product_discounts: {
              create: { discount_id: product_discounts },
            },
          }),
      },
      include: {
        product_photos: true,
        product_brands: { include: { brands: true } },
        product_categories: { include: { categories: true } },
        product_colors: { include: { colors: true } },
        product_sizes: { include: { sizes: true } },
        product_tags: { include: { tags: true } },
        product_discounts: { include: { discounts: true } },
      },
    });
    return createdProduct;
  });
  return newProduct;
}

// Оновлена функція оновлення продукту
async function updateProductWithRelations(
  productId: number,
  data: CreateProductInput
) {
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
    new_product_photos,
    photos_to_delete,
    product_discounts,
  } = data;
  console.log(data);

  try {
    return await prismaDb.$transaction(async (tx) => {
      // 1. Якщо є фото для видалення, видаляємо їх
      if (photos_to_delete && photos_to_delete.length > 0) {
        await tx.product_photos.deleteMany({
          where: {
            cloudinary_public_id: { in: photos_to_delete },
          },
        });
      }

      // 2. Якщо є нові фото, перевіряємо і готуємо їх для додавання
      const photosToAdd = (
        Array.isArray(new_product_photos) ? new_product_photos : []
      )
        .filter(
          (p): p is ProductPhotoInput =>
            p &&
            typeof p.photo_url === "string" &&
            p.photo_url.trim() !== "" &&
            typeof p.cloudinary_public_id === "string" &&
            p.cloudinary_public_id.trim() !== ""
        )
        .map((p) => ({
          product_id: productId,
          photo_url: p.photo_url,
          cloudinary_public_id: p.cloudinary_public_id,
        }));

      // 3. Додаємо нові фото, якщо вони є
      if (photosToAdd.length > 0) {
        await tx.product_photos.createMany({
          data: photosToAdd,
        });
      }

      // 4. Оновлюємо сам продукт та його зв'язки
      const updatedProduct = await tx.products.update({
        where: { id: productId },
        data: {
          name,
          description: description ?? undefined,
          price,
          stock: stock ?? 0,
          sales_count: sales_count ?? 0,
          updated_at: new Date(),

          // Оновлення зв'язків (видалити старі, створити нові)
          product_brands: {
            deleteMany: {},
            create: { brand_id: product_brands },
          },
          product_categories: {
            deleteMany: {},
            create: product_categories.map((categoryId) => ({
              category_id: categoryId,
            })),
          },
          product_colors: {
            deleteMany: {},
            create: product_colors.map((colorId) => ({
              color_id: colorId,
            })),
          },
          product_sizes: {
            deleteMany: {},
            create: product_sizes.map((sizeId) => ({
              size_id: sizeId,
            })),
          },
          // Оновлення тегів
          ...(product_tags !== undefined && {
            product_tags: {
              deleteMany: {},
              create: (product_tags || []).map((tagId) => ({
                tag_id: tagId,
              })),
            },
          }),
          ...(product_discounts !== undefined && product_discounts !== null
            ? {
                product_discounts: {
                  deleteMany: {},
                  create: { discount_id: product_discounts },
                },
              }
            : {
                product_discounts: {
                  deleteMany: {},
                },
              }),
        },
        include: {
          product_photos: true,
          product_brands: { include: { brands: true } },
          product_categories: { include: { categories: true } },
          product_colors: { include: { colors: true } },
          product_sizes: { include: { sizes: true } },
          product_tags: { include: { tags: true } },
          product_discounts: { include: { discounts: true } },
        },
      });

      return updatedProduct;
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      console.warn(`Update failed: Product with ID ${productId} not found.`);
      return null;
    }
    console.error(`Error updating product ${productId}:`, error);
    throw error;
  }
}

// Функція отримання активних знижок для продукту
async function getActiveDiscountsForProduct(productId: number) {
  const currentDate = new Date();

  const productWithDiscounts = await prismaDb.products.findUnique({
    where: { id: productId },
    include: {
      product_discounts: {
        include: {
          discounts: true,
        },
        where: {
          discounts: {
            is_active: true,
            start_date: { lte: currentDate },
            end_date: { gte: currentDate },
          },
        },
      },
    },
  });

  return (
    productWithDiscounts?.product_discounts.map((pd) => pd.discounts) || []
  );
}

// Функція для розрахунку ціни з урахуванням знижок
async function calculateDiscountedPrice(productId: number) {
  const product = await prismaDb.products.findUnique({
    where: { id: productId },
    select: { price: true },
  });

  if (!product) return null;

  const activeDiscounts = await getActiveDiscountsForProduct(productId);

  if (activeDiscounts.length === 0) {
    return product.price;
  }

  // Знаходимо максимальну знижку
  const maxDiscount = activeDiscounts.reduce(
    (max, discount) =>
      discount.discount_percentage.gt(max) ? discount.discount_percentage : max,
    new Prisma.Decimal(0)
  );

  // Розраховуємо ціну зі знижкою
  const discountMultiplier = new Prisma.Decimal(1).minus(maxDiscount.div(100));
  const discountedPrice = product.price.mul(discountMultiplier);

  return discountedPrice;
}

// Експортуємо методи сервісу
export const productService = {
  createProductWithRelations,
  updateProductWithRelations,
  getActiveDiscountsForProduct,
  calculateDiscountedPrice,
};
