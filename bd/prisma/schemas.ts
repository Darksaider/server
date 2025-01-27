import { z } from "zod";

// Схеми для створення нових записів (без id, created_at, updated_at)
export const createUserSchema = z.object({
  name: z.string().nonempty({ message: "Ім'я не може бути пустим" }),
  email: z.string().email({ message: "Некоректний формат email" }),
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
