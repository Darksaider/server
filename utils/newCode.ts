import { PrismaClient } from "@prisma/client";
import {
  PRICE_DECIMAL_PLACES,
  RATING_DECIMAL_PLACES,
  DEFAULT_PAGE,
  DEFAULT_LIMIT,
  MIN_RATING_RANGE,
  MAX_RATING_RANGE,
} from "./constans";
import { Decimal } from "@prisma/client/runtime/library";

// Константи за замовчуванням

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
  minRating?: number;
  hasDiscount?: boolean;
  sortBy?:
    | "price_asc"
    | "price_desc"
    | "id_desc"
    | "newest"
    | "popular"
    | "rating_desc";
  page?: number;
  limit?: number;
}

// Тип для продукту з включеними зв'язками
type ProductWithRelations = {
  id: number;
  name: string;
  description: string | null;
  price: string | Decimal;
  stock: number;
  created_at: Date;
  sales_count: number | null;
  product_photos: any[];
  product_brands: { brands: any }[];
  product_categories: { categories: any }[];
  product_colors: { colors: any }[];
  product_sizes: { sizes: any }[];
  product_tags: { tags: any }[];
  product_discounts: { discounts: any }[];
  comments: { rating: number }[];
};

// Допоміжна функція для розрахунку знижки
function calculateDiscountedPrice(product: ProductWithRelations): {
  discountedPrice: number;
  discountPercentage: number;
} {
  const hasActiveDiscount = product.product_discounts?.some((pd) => {
    const discount = pd.discounts;
    const now = new Date();
    return (
      discount.is_active &&
      new Date(discount.start_date) <= now &&
      new Date(discount.end_date) >= now
    );
  });

  let discountPercentage = 0;
  let discountedPrice = Number(product.price);

  if (hasActiveDiscount) {
    const activeDiscount = product.product_discounts?.find((pd) => {
      const discount = pd.discounts;
      const now = new Date();
      return (
        discount.is_active &&
        new Date(discount.start_date) <= now &&
        new Date(discount.end_date) >= now
      );
    });

    if (activeDiscount) {
      discountPercentage = Number(activeDiscount.discounts.discount_percentage);
      discountedPrice = Number(product.price) * (1 - discountPercentage / 100);
      discountedPrice =
        Math.round(discountedPrice * PRICE_DECIMAL_PLACES) /
        PRICE_DECIMAL_PLACES;
    }
  }

  return { discountedPrice, discountPercentage };
}

// Допоміжна функція для розрахунку рейтингу
export function calculateRating(comments: { rating: number }[]): {
  rating: number;
  reviewsCount: number;
} {
  const ratings = comments?.map((comment) => comment.rating) || [];
  const avgRating =
    ratings.length > 0
      ? ratings.reduce((sum: number, rating: number) => sum + rating, 0) /
        ratings.length
      : 0;

  return {
    rating:
      Math.round(avgRating * RATING_DECIMAL_PLACES) / RATING_DECIMAL_PLACES,
    reviewsCount: ratings.length,
  };
}

// Основна функція для отримання фільтрованих продуктів
export async function getFilteredProducts(
  prisma: PrismaClient,
  filters: ProductFilterParams
) {
  console.log(filters);

  try {
    const page = filters.page || DEFAULT_PAGE;
    const limit = filters.limit || DEFAULT_LIMIT;

    // Будуємо базові умови WHERE
    const baseWhereConditions: Record<string, any> = {};

    // Текстовий пошук
    if (filters.search) {
      baseWhereConditions.OR = [
        { name: { contains: filters.search, mode: "insensitive" } },
        { description: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    // Наявність на складі
    if (filters.inStock !== undefined) {
      baseWhereConditions.stock = filters.inStock ? { gt: 0 } : { equals: 0 };
    }

    // Фільтрація по зв'язаних таблицях
    if (filters.categories?.length) {
      baseWhereConditions.product_categories = {
        some: { category_id: { in: filters.categories } },
      };
    }

    if (filters.brands?.length) {
      baseWhereConditions.product_brands = {
        some: { brand_id: { in: filters.brands } },
      };
    }

    if (filters.colors?.length) {
      baseWhereConditions.product_colors = {
        some: { color_id: { in: filters.colors } },
      };
    }

    if (filters.sizes?.length) {
      baseWhereConditions.product_sizes = {
        some: { size_id: { in: filters.sizes } },
      };
    }

    if (filters.tags?.length) {
      baseWhereConditions.product_tags = {
        some: { tag_id: { in: filters.tags } },
      };
    }
    if (filters.hasDiscount) {
      baseWhereConditions.product_discounts = {
        some: {
          discounts: {
            is_active: true,
            start_date: { lte: new Date() },
            end_date: { gte: new Date() },
          },
        },
      };
    }
    // Фільтрація за рейтингом
    if (filters.minRating !== undefined && filters.minRating > 0) {
      const productRatings = await prisma.comments.groupBy({
        by: ["product_id"],
        _avg: { rating: true },
        where: {
          product_id: { not: null },
          rating: { gte: MIN_RATING_RANGE, lte: MAX_RATING_RANGE },
        },
      });

      const productIdsWithMinRating = productRatings
        .filter(
          (pr) =>
            pr._avg.rating !== null && pr._avg.rating >= filters.minRating!
        )
        .map((pr) => pr.product_id!);

      if (productIdsWithMinRating.length > 0) {
        baseWhereConditions.id = { in: productIdsWithMinRating };
      } else {
        return {
          products: [],
          totalCount: 0,
        };
      }
    }

    // Отримуємо всі продукти, що відповідають базовим критеріям
    const allProducts = await prisma.products.findMany({
      where: baseWhereConditions,
      include: {
        product_photos: true,
        product_brands: { include: { brands: true } },
        product_categories: { include: { categories: true } },
        product_colors: { include: { colors: true } },
        product_sizes: { include: { sizes: true } },
        product_tags: { include: { tags: true } },
        product_discounts: { include: { discounts: true } },
        comments: true,
      },
    });

    // Обробляємо всі продукти та додаємо розраховані поля
    let processedProducts = allProducts.map((product) => {
      const { discountedPrice, discountPercentage } = calculateDiscountedPrice(
        product as ProductWithRelations
      );
      const { rating, reviewsCount } = calculateRating(product.comments);

      return {
        ...product,
        discounted_price: discountedPrice.toString(),
        discount_percentage: discountPercentage,
        rating,
        reviews_count: reviewsCount,
      };
    });

    // Фільтрація за ціною (після розрахунку знижок)
    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      processedProducts = processedProducts.filter((product) => {
        const priceToCompare = parseFloat(product.discounted_price);

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

    // Сортування
    if (filters.sortBy) {
      switch (filters.sortBy) {
        case "price_asc":
          processedProducts.sort(
            (a, b) =>
              parseFloat(a.discounted_price) - parseFloat(b.discounted_price)
          );
          break;
        case "price_desc":
          processedProducts.sort(
            (a, b) =>
              parseFloat(b.discounted_price) - parseFloat(a.discounted_price)
          );
          break;
        case "rating_desc":
          processedProducts.sort((a, b) => b.rating - a.rating);
          break;
        case "newest":
          processedProducts.sort(
            (a, b) =>
              new Date(b.created_at!).getTime() -
              new Date(a.created_at!).getTime()
          );
          break;
        case "popular":
          processedProducts.sort(
            (a, b) => (b.sales_count || 0) - (a.sales_count || 0)
          );
          break;
        case "id_desc":
          processedProducts.sort((a, b) => b.id - a.id);
          break;
        default:
          processedProducts.sort((a, b) => a.id - b.id);
      }
    }

    // Загальна кількість після всіх фільтрів
    const totalCount = processedProducts.length;

    // Пагінація (застосовується в кінці після всіх фільтрів)
    const skip = (page - 1) * limit;
    const paginatedProducts = processedProducts.slice(skip, skip + limit);
    const products = paginatedProducts.map((product) => ({
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      sales_count: product.sales_count,
      discounted_price: product.discounted_price,
      discount_percentage: product.discount_percentage,
      rating: product.rating,
      reviews_count: product.reviews_count,
      created_at: product.created_at,
      product_photos: product.product_photos.map((photo) => photo),
      product_brands: product.product_brands[0].brands,
      product_categories: product.product_categories.map((pc) => pc.categories),
      product_colors: product.product_colors.map((pc) => pc.colors),
      product_sizes: product.product_sizes.map((ps) => ps.sizes),
      product_tags: product.product_tags.map((pt) => pt.tags),
      product_discounts: product.product_discounts[0],
    }));

    return {
      products: products,
      totalCount: totalCount,
    };
  } catch (error) {
    console.error("Error fetching filtered products:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    throw new Error(`Failed to fetch products: ${errorMessage}`);
  }
}
