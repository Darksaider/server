import prismaDb from "../prisma/prisma";

export async function getUniqueProductAttributes() {
  const colors = await prismaDb.colors.findMany({
    where: { product_colors: { some: {} } },
    select: { id: true, name: true, hex_code: true },
  });

  const tags = await prismaDb.tags.findMany({
    where: { product_tags: { some: {} } },
    select: { id: true, name: true },
  });
  const brands = await prismaDb.brands.findMany({
    where: { product_brands: { some: {} } },
    select: { id: true, name: true },
  });

  const categories = await prismaDb.categories.findMany({
    where: { product_categories: { some: {} } },
    select: { id: true, name: true },
  });

  const sizes = await prismaDb.sizes.findMany({
    where: { product_sizes: { some: {} } },
    select: { id: true, size: true },
  });

  return { colors, tags, categories, sizes, brands };
}

export async function getAllProductAttributes() {
  const colors = await prismaDb.colors.findMany({
    select: { id: true, name: true, hex_code: true },
  });

  const tags = await prismaDb.tags.findMany({
    select: { id: true, name: true },
  });

  const brands = await prismaDb.brands.findMany({
    select: { id: true, name: true },
  });

  const categories = await prismaDb.categories.findMany({
    select: { id: true, name: true },
  });

  const sizes = await prismaDb.sizes.findMany({
    select: { id: true, size: true },
  });
  const discounts = await prismaDb.discounts.findMany({
    select: { id: true, name: true },
  });

  return { colors, tags, categories, sizes, brands, discounts };
}
