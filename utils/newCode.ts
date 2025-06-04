import { PrismaClient } from "@prisma/client";

// Типи даних для фільтрів
export interface ProductFilterParams {
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  categories?: number[];
  brands?: number[];
  colors?: number[];
  sizes?: number[];
  tags?: number[];
  inStock?: boolean;
  minRating?: number; // Додано фільтр по мінімальному рейтингу
  sortBy?:
    | "price_asc"
    | "price_desc"
    | "id_desc"
    | "newest"
    | "popular"
    | "rating_desc"; // Додано сортування за рейтингом
  page?: number;
  limit?: number;
}

// Функція для отримання фільтрованих продуктів
export async function getFilteredProducts(
  prisma: PrismaClient,
  filters: ProductFilterParams
) {
  try {
    // Будуємо умови WHERE для фільтрації
    const whereConditions: any = {};

    // Текстовий пошук
    if (filters.search) {
      whereConditions.OR = [
        { name: { contains: filters.search, mode: "insensitive" } },
        { description: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    // Наявність на складі
    if (filters.inStock !== undefined) {
      whereConditions.stock = filters.inStock ? { gt: 0 } : { equals: 0 };
    }

    // Підготовка запиту
    const productsQuery = {
      where: whereConditions,
      include: {
        product_photos: true,
        product_brands: {
          include: {
            brands: true,
          },
        },
        product_categories: {
          include: {
            categories: true,
          },
        },
        product_colors: {
          include: {
            colors: true,
          },
        },
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
        product_discounts: {
          include: {
            discounts: true,
          },
        },
        comments: true, // Додано включення коментарів для обрахунку рейтингу
      },
      orderBy: {},
    };

    // Додаємо фільтрацію по зв'язаних таблицях
    // Категорії
    if (filters.categories?.length) {
      productsQuery.where.product_categories = {
        some: {
          category_id: { in: filters.categories },
        },
      };
    }

    // Бренди
    if (filters.brands?.length) {
      productsQuery.where.product_brands = {
        some: {
          brand_id: { in: filters.brands },
        },
      };
    }

    // Кольори
    if (filters.colors?.length) {
      productsQuery.where.product_colors = {
        some: {
          color_id: { in: filters.colors },
        },
      };
    }

    // Розміри
    if (filters.sizes?.length) {
      productsQuery.where.product_sizes = {
        some: {
          size_id: { in: filters.sizes },
        },
      };
    }

    // Теги
    if (filters.tags?.length) {
      productsQuery.where.product_tags = {
        some: {
          tag_id: { in: filters.tags },
        },
      };
    }

    // Фільтрація за мінімальним рейтингом через попереднє отримання даних про рейтинги
    let productIdsWithMinRating: number[] = [];
    if (filters.minRating !== undefined && filters.minRating > 0) {
      // Отримуємо середній рейтинг для всіх продуктів
      const productRatings = await prisma.comments.groupBy({
        by: ["product_id"],
        _avg: {
          rating: true,
        },
        where: {
          product_id: { not: null },
          rating: { gte: 0, lte: 5 },
        },
      });

      // Фільтруємо ID продуктів з рейтингом не менше заданого
      productIdsWithMinRating = productRatings
        .filter(
          (pr) => pr._avg.rating !== null && pr._avg.rating >= filters.minRating
        )
        .map((pr) => pr.product_id);

      // Додаємо фільтр по ID в основний запит
      if (productIdsWithMinRating.length > 0) {
        whereConditions.id = { in: productIdsWithMinRating };
      } else {
        // Якщо немає продуктів з таким рейтингом, повертаємо пустий результат
        return {
          products: [],
          productsCourt: 0,
        };
      }
    }

    // Сортування
    if (filters.sortBy) {
      switch (filters.sortBy) {
        case "newest":
          productsQuery.orderBy = { created_at: "desc" };
          break;
        case "popular":
          productsQuery.orderBy = { sales_count: "desc" };
          break;
        case "id_desc":
          productsQuery.orderBy = { id: "desc" };
          break;
        // Сортування за рейтингом буде застосовано після отримання продуктів
        default:
          productsQuery.orderBy = { id: "asc" };
      }
    } else {
      productsQuery.orderBy = { id: "asc" };
    }

    // Спочатку отримуємо загальну кількість
    const totalProducts = await prisma.products.count({
      where: productsQuery.where,
    });

    // Пагінація
    const page = filters.page || 1;
    const limit = filters.limit || 12;
    const skip = (page - 1) * limit;

    // Отримуємо продукти з пагінацією
    let products = await prisma.products.findMany({
      ...productsQuery,
      take: limit,
      skip: skip,
    });

    // Обробляємо отримані продукти для правильного формату
    const processedProducts = products.map((product) => {
      // Обрахування середнього рейтингу продукту
      const ratings = product.comments
        ? product.comments.map((comment) => comment.rating)
        : [];
      const avgRating =
        ratings.length > 0
          ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length
          : 0;

      // Округлюємо до 1 десяткового знаку
      const roundedRating = Math.round(avgRating * 10) / 10;

      // Кількість відгуків
      const reviewsCount = ratings.length;

      // Перевіряємо, чи є активна знижка
      const hasActiveDiscount = product.product_discounts.some((pd) => {
        const discount = pd.discounts;
        const now = new Date();
        return (
          discount.is_active &&
          new Date(discount.start_date) <= now &&
          new Date(discount.end_date) >= now
        );
      });

      // Знаходимо відсоток знижки та розраховуємо ціну зі знижкою
      let discountPercentage = 0;
      let discountedPrice = product.price;

      if (hasActiveDiscount) {
        const activeDiscount = product.product_discounts.find((pd) => {
          const discount = pd.discounts;
          const now = new Date();
          return (
            discount.is_active &&
            new Date(discount.start_date) <= now &&
            new Date(discount.end_date) >= now
          );
        });

        if (activeDiscount) {
          discountPercentage = Number(
            activeDiscount.discounts.discount_percentage
          );
          discountedPrice =
            Number(product.price) * (1 - discountPercentage / 100);
          discountedPrice = Math.round(discountedPrice * 100) / 100; // Округлення до 2 знаків
        }
      }

      // Повертаємо об'єкт продукту у потрібному форматі зі збереженням всіх існуючих полів
      return {
        ...product,
        discounted_price: discountedPrice.toString(),
        discount_percentage: discountPercentage,
        rating: roundedRating,
        reviews_count: reviewsCount,
      };
    });

    // Фільтрація за ціною (включаючи знижки)
    let filteredProducts = processedProducts;

    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      filteredProducts = filteredProducts.filter((product) => {
        const priceToCompare = parseFloat(
          product.discounted_price || product.price
        );

        if (
          filters.minPrice !== undefined &&
          priceToCompare < filters.minPrice
        ) {
          return false;
        }

        if (
          filters.maxPrice !== undefined &&
          priceToCompare > filters.maxPrice
        ) {
          return false;
        }

        return true;
      });
    }

    // Сортування за ціною (з урахуванням знижок)
    if (filters.sortBy === "price_asc" || filters.sortBy === "price_desc") {
      filteredProducts.sort((a, b) => {
        const priceA = parseFloat(a.discounted_price || a.price);
        const priceB = parseFloat(b.discounted_price || b.price);
        return filters.sortBy === "price_asc"
          ? priceA - priceB
          : priceB - priceA;
      });
    }

    // Сортування за рейтингом (від найвищого до найнижчого)
    if (filters.sortBy === "rating_desc") {
      filteredProducts.sort((a, b) => b.rating - a.rating);
    }

    return {
      products: filteredProducts,
      productsCourt: filteredProducts.length,
    };
  } catch (error: any) {
    console.error("Error fetching filtered products:", error);
    throw new Error(`Failed to fetch products: ${error.message}`);
  }
}
