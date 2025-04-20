import { z } from "zod";

// Схеми для створення нових записів (без id, created_at, updated_at)
export const createUserSchema = z.object({
  first_name: z.string().nonempty({ message: "Ім'я не може бути пустим" }),
  last_name: z.string().nonempty({ message: "Прізвище  не може бути пустим" }),
  email: z.string().email({ message: "Некоректний формат email" }),
  phone_number: z.string().nonempty({ message: "Номер не може бути пустим" }),
  password_hash: z.string().nonempty({ message: "Пароль не може бути пустим" }),
  avatar_url: z.string().optional(),
  role: z.string().optional(),
});

export const createCategorySchema = z.object({
  name: z.string().nonempty({ message: "Назва категорії не може бути пустою" }),
  description: z.string().optional(),
});

export const createProductSchema = z.object({
  name: z.string().nonempty({ message: "Назва продукту не може бути пустою" }),
  description: z.string().optional(),
  price: z
    .number()
    .min(0, { message: "Ціна має бути більше або дорівнювати 0" }),
  stock: z
    .number()
    .min(0, { message: "Запас має бути більше або дорівнювати 0" }),
  sales_count: z.number().optional(),
  category_id: z.number().optional(),
  default_discount_id: z.number().optional(),
});

export const createProduct_PhotoSchema = z.object({
  product_id: z.number({
    required_error: "Поле product_id є обов'язковим",
  }),
  photo_url: z
    .string()
    .nonempty({ message: "URL фотографії не може бути пустим" }),
  position: z
    .number()
    .min(0, { message: "Позиція має бути більше або дорівнювати 0" }),
});

export const createCartSchema = z.object({
  user_id: z.number({ required_error: "Поле user_id є обов'язковим" }),
  product_id: z
    .number({ required_error: "Поле product_id є обов'язковим" })
    .min(0, { message: "product_id має бути більше або дорівнювати 0" }),
  quantity: z
    .number({ required_error: "Поле quantity є обов'язковим" })
    .min(1, { message: "Кількість має бути більшою за 0" }),
});

export const createFavoritesSchema = z.object({
  user_id: z.number({ required_error: "Поле user_id є обов'язковим" }),
  product_id: z
    .number({ required_error: "Поле product_id є обов'язковим" })
    .min(0, { message: "product_id має бути більше або дорівнювати 0" }),
});

export const createDiscountSchema = z.object({
  name: z.string().nonempty({ message: "Назва знижки не може бути пустою" }),
  description: z.string().optional(),
  discount_percentage: z
    .number()
    .min(0, { message: "Відсоток знижки має бути більшим або дорівнювати 0" })
    .max(100, {
      message: "Відсоток знижки має бути меншим або дорівнювати 100",
    }),
  start_date: z.string(),
  end_date: z.string(),
  is_active: z.boolean(),
});

export const createSizeSchema = z.object({
  size: z.string().nonempty({ message: "Розмір не може бути пустим" }),
});

export const createColorSchema = z.object({
  name: z.string().nonempty({ message: "Назва кольору не може бути пустою" }),
  hex_code: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, { message: "Некоректний hex-код кольору" }),
});

export const createProduct_colorsSchema = z.object({
  product_id: z.number({ required_error: "Поле product_id є обов'язковим" }),
  color_id: z.number({ required_error: "Поле color_id є обов'язковим" }),
});

export const createProduct_sizesSchema = z.object({
  product_id: z.number({ required_error: "Поле product_id є обов'язковим" }),
  size_id: z.number({ required_error: "Поле size_id є обов'язковим" }),
});

export const createBrandSchema = z.object({
  name: z.string().nonempty({ message: "Назва бренду не може бути пустою" }),
});

export const createProduct_brandsSchema = z.object({
  product_id: z.number({ required_error: "Поле product_id є обов'язковим" }),
  brand_id: z.number({ required_error: "Поле brand_id є обов'язковим" }),
});

export const createTagSchema = z.object({
  name: z.string().nonempty({ message: "Назва тега не може бути пустою" }),
});

export const createProduct_tagsSchema = z.object({
  product_id: z.number({ required_error: "Поле product_id є обов'язковим" }),
  tag_id: z.number({ required_error: "Поле tag_id є обов'язковим" }),
});

// src/schemas/upload.schema.ts
import { t } from "elysia";

// Схема для завантаження одного файлу (якщо потрібна)
export const uploadSingleBodySchema = t.Object({
  image: t.File({
    maxSize: "5m",
    types: ["image/jpeg", "image/png", "image/webp", "image/gif"],
  }),
  // Можна додати інші поля, якщо вони потрібні
  // description: t.Optional(t.String())
});

// Схема для завантаження кількох файлів
export const uploadMultipleBodySchema = t.Object({
  images: t.Array(
    t.File({
      maxSize: "5m", // Макс. розмір для кожного файлу
      types: ["image/jpeg", "image/png", "image/webp", "image/gif"],
    }),
    {
      minItems: 1, // Мінімум 1 файл
      // maxItems: 10,  // Максимум 10 файлів (опціонально)
    }
  ),
  // Можна додати інші поля, якщо вони потрібні
  // category: t.Optional(t.String())
});

// src/modules/products/product.types.ts

// Описуємо структуру даних, яку очікуємо отримати в тілі запиту
// після того, як ваша власна валідація відпрацювала.
export interface CreateProductInput {
  id?: number;
  name: string;
  description?: string | null; // Дозволяємо null, якщо ваша валідація це пропускає
  price: number; // Припускаємо, що ціна вже конвертована в число
  stock?: number | null;
  sales_count?: number | null;
  product_brands: number;
  product_categories: number[];
  product_colors: number[];
  product_sizes: number[];
  product_tags?: number[] | null;
  product_photos: {
    newFiles: File[];
    existingImagesIds: string[];
    imagesToDelete: number[];
  };
  // product_discounts?: number[] | null;
}
