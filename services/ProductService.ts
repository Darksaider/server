// user.service.ts
import productRepository from "../repositories/productRepository";
import { handleServiceError } from "../utils/errors";

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

const getProductById = async (id: number) => {
  return await handleServiceError(
    () => productRepository.findById(id, { include: productInclude }),
    `Failed to get product by id ${id}`
  );
};

// const getProductsByNewFilter = async (filter: any) => {
//   return await handleServiceError(
//     // Передаємо include, якщо метод його підтримує
//     () => productRepository.getProductsByNewFilter(filter),
//     "Failed to get products by filter"
//   );
// };
const getProductsNew = async (filter: any) => {
  return await handleServiceError(
    // Передаємо include, якщо метод його підтримує
    () => productRepository.getProductNew(filter),
    "Failed to get products by filter"
  );
};
const deleteProduct = async (id: number) => {
  return await handleServiceError(
    // Передаємо include, якщо метод його підтримує
    () => productRepository.deleteProduct(id),
    "Failed to get products by filter"
  );
};

export default {
  getProductById,
  // getProductsByNewFilter,
  deleteProduct,
  getProductsNew,
};
