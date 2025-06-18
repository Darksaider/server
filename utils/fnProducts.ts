// Типи для параметрів фільтрації
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
  hasDiscount?: boolean;
  sortBy?: "price_asc" | "id_desc" | "price_desc" | "newest" | "popular";
  page?: number;
  limit?: number;
}

export function buildProductFilters(filters: ProductFilterParams) {
  const where: any = {};
  const orderBy: any = {};

  // Текстовий пошук
  if (filters.search) {
    where.OR = [
      { name: { contains: filters.search, mode: "insensitive" } },
      { description: { contains: filters.search, mode: "insensitive" } },
    ];
  }

  // Ціновий діапазон
  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    where.price = {};
    if (filters.minPrice !== undefined) {
      where.price.gte = filters.minPrice;
    }
    if (filters.maxPrice !== undefined) {
      where.price.lte = filters.maxPrice;
    }
  }

  // Фільтрація за категоріями
  if (filters.categories && filters.categories.length > 0) {
    where.product_categories = {
      some: {
        category_id: { in: filters.categories },
      },
    };
  }

  // Фільтрація за брендами
  if (filters.brands && filters.brands.length > 0) {
    where.product_brands = {
      some: {
        brand_id: { in: filters.brands },
      },
    };
  }

  // Фільтрація за кольорами
  if (filters.colors && filters.colors.length > 0) {
    where.product_colors = {
      some: {
        color_id: { in: filters.colors },
      },
    };
  }

  // Фільтрація за розмірами
  if (filters.sizes && filters.sizes.length > 0) {
    where.product_sizes = {
      some: {
        size_id: { in: filters.sizes },
      },
    };
  }

  // Фільтрація за тегами
  if (filters.tags && filters.tags.length > 0) {
    where.product_tags = {
      some: {
        tag_id: { in: filters.tags },
      },
    };
  }

  // Наявність на складі
  if (filters.inStock !== undefined) {
    where.stock = filters.inStock ? { gt: 0 } : { equals: 0 };
  }

  // Налаштування сортування
  switch (filters.sortBy) {
    case "price_asc":
      orderBy.price = "asc";
      break;
    case "id_desc":
      orderBy.id = "desc";
      break;
    case "price_desc":
      orderBy.price = "desc";
      break;
    case "newest":
      orderBy.created_at = "desc";
      break;
    case "popular":
      orderBy.sales_count = "desc";
      break;
    default:
      orderBy.id = "asc";
  }

  // Налаштування пагінації
  const page = filters.page || 1;
  const limit = filters.limit || 4;
  const skip = (page - 1) * limit;

  // Стандартні зв'язки для продуктів
  const include = {
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
  };

  return {
    where,
    orderBy,
    skip,
    take: limit,
    include,
  };
}

// Функція для парсингу параметрів запиту
export function parseProductFilters(
  query: Record<string, any>
): ProductFilterParams {
  const filters: ProductFilterParams = {};

  // Текстовий пошук
  if (query.search) {
    filters.search = String(query.search);
  }

  // Ціновий діапазон
  if (query.minPrice) {
    filters.minPrice = parseFloat(String(query.minPrice));
  }
  if (query.maxPrice) {
    filters.maxPrice = parseFloat(String(query.maxPrice));
  }
  if (query.hasDiscount) {
    filters.hasDiscount = query.hasDiscount;
  }
  // Обробка масивів
  const parseArrayParam = (param: string) => {
    if (!query[param]) return undefined;

    // Якщо передано як масив
    if (Array.isArray(query[param])) {
      return query[param].map(Number);
    }

    // Якщо передано як рядок з комами
    if (typeof query[param] === "string" && query[param].includes(",")) {
      return query[param].split(",").map(Number);
    }

    // Якщо передано як одиночне значення
    return [Number(query[param])];
  };

  filters.categories = parseArrayParam("categories");
  filters.brands = parseArrayParam("brands");
  filters.colors = parseArrayParam("colors");
  filters.sizes = parseArrayParam("sizes");
  filters.tags = parseArrayParam("tags");

  // Наявність на складі
  if (query.inStock !== undefined) {
    filters.inStock = query.inStock === "true" || query.inStock === true;
  }
  // if (query.hasDiscount !== undefined) {
  //   filters.hasDiscount =
  //     query.hasDiscount === "true" || query.hasDiscount === true;
  // }
  // Сортування
  const validSortValues = ["price_asc", "price_desc", "newest", "popular"];
  if (query.sortBy && validSortValues.includes(String(query.sortBy))) {
    filters.sortBy = String(query.sortBy) as
      | "price_asc"
      | "price_desc"
      | "newest"
      | "popular";
  }

  // Пагінація
  if (query.page) {
    filters.page = parseInt(String(query.page)) || 1;
  }
  if (query.limit) {
    filters.limit = parseInt(String(query.limit)) || 4;
  }

  return filters;
}
