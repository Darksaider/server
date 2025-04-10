import {
  brands,
  cart,
  categories,
  colors,
  discounts,
  favorites,
  product_brands,
  product_colors,
  product_photos,
  product_sizes,
  product_tags,
  product_categories,
  product_discounts,
  products,
  sizes,
  tags,
  users,
} from "@prisma/client";

// Типи для brands
export type Brand = brands;
export type CreateBrand = Omit<brands, "id" | "product_brands">;

// Типи для cart
export type Cart = cart;
export type CreateCart = Omit<cart, "id" | "added_at" | "user" | "product">;

// Типи для categories
export type Category = categories;
export type CreateCategory = Omit<
  categories,
  "id" | "created_at" | "updated_at" | "products" | "categories_products"
>;
export type UpdateCategory = Partial<
  Omit<
    categories,
    "id" | "created_at" | "updated_at" | "products" | "categories_products"
  >
>;

// Типи для colors
export type Color = colors;
export type CreateColor = Omit<colors, "id" | "product_colors">;

// Типи для discounts
export type Discount = discounts;
export type CreateDiscount = Omit<
  discounts,
  "id" | "created_at" | "updated_at" | "products" | "discounts_products"
>;

// Типи для favorites
export type Favorite = favorites;
export type CreateFavorite = Omit<
  favorites,
  "id" | "added_at" | "user" | "product"
>;

// Типи для product_brands
export type ProductBrand = product_brands;
export type CreateProductBrand = Omit<
  product_brands,
  "id" | "brand" | "product"
>;

// Типи для product_colors
export type ProductColor = product_colors;
export type CreateProductColor = Omit<
  product_colors,
  "id" | "color" | "product"
>;

// Типи для product_photos
export type ProductPhoto = product_photos;
export type CreateProductPhoto = Omit<
  product_photos,
  "id" | "created_at" | "product"
>;
export type UpdateProductPhoto = Partial<
  Omit<product_photos, "id" | "created_at" | "product">
>;

// Типи для product_sizes
export type ProductSize = product_sizes;
export type CreateProductSize = Omit<product_sizes, "id" | "product" | "size">;

// Типи для product_tags
export type ProductTag = product_tags;
export type CreateProductTag = Omit<product_tags, "id" | "product" | "tag">;

// Типи для products
export type Product = products;
export type CreateProduct = Omit<
  products,
  | "id"
  | "created_at"
  | "updated_at"
  | "cart"
  | "favorites"
  | "product_brands"
  | "product_colors"
  | "product_photos"
  | "product_sizes"
  | "product_tags"
  | "categories_products"
  | "discounts_products"
>;
export type UpdateProduct = Partial<
  Omit<
    products,
    | "id"
    | "created_at"
    | "updated_at"
    | "cart"
    | "favorites"
    | "product_brands"
    | "product_colors"
    | "product_photos"
    | "product_sizes"
    | "product_tags"
    | "categories_products"
    | "discounts_products"
  >
>;

// Типи для CategoriesProduct
export type CategoriesProduct = product_categories;

// Типи для DiscountsProduct
export type DiscountsProductT = product_discounts;
interface ProductBrandWithBrand extends ProductBrand {
  brand: Brand;
}

interface ProductColorWithColor extends ProductColor {
  color: Color;
}
interface ProductSizeWithSize extends ProductSize {
  size: Size;
}
interface ProductTagWithTag extends ProductTag {
  tag: Tag;
}
export type ProductWithRelations = Product & {
  discountedPrice?: number;
  categories_products: CategoriesProduct[];
  discounts_products: DiscountsProductT[];
  product_brands: ProductBrandWithBrand[];
  product_colors: ProductColorWithColor[];
  product_photos: ProductPhoto[];
  product_sizes: ProductSizeWithSize[];
  product_tags: ProductTagWithTag[];
};

// Типи для sizes
export type Size = sizes;
export type CreateSize = Omit<sizes, "id" | "product_sizes">;

// Типи для tags
export type Tag = tags;
export type CreateTag = Omit<tags, "id" | "product_tags">;

// Типи для users
export type User = users;
export type LoginUser = {
  email: string,
  password_hash: string
};
export type createUser = Omit<
  users,
  "id" | "created_at" | "updated_at" | "cart" | "favorites"
>;
export type UpdateUser = Partial<
  Omit<users, "id" | "created_at" | "updated_at" | "cart" | "favorites">
>;

export type Filter<T> = {
  [K in keyof T]?:
  | T[K]
  | {
    equals?: T[K];
    in?: T[K][];
    notIn?: T[K][];
    lt?: T[K];
    lte?: T[K];
    gt?: T[K];
    gte?: T[K];
    contains?: string;
    startsWith?: string;
    endsWith?: string;
  };
};
export type ProductFilter = {
  OR?: ProductFilter[];
  AND?: ProductFilter[];
  [key: string]: any;
  price?: Filter<Product>["price"];
  name?: string | Filter<Product>["name"];
  description?: string | Filter<Product>["description"];
  stock?: number | Filter<Product>["stock"];
  sales_count?: number | Filter<Product>["sales_count"];
  category?: string | Filter<Product>["name"];
  discount?: Filter<Product>["name"];
  color?: string | Filter<Product>["name"];
  size?: string | Filter<Product>["name"];
  brand?: string | Filter<Product>["name"];
  tag?: string | Filter<Product>["name"];
};
