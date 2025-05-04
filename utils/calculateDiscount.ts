import { Prisma, discounts as Discount } from "@prisma/client";

interface DiscountCalculationResult {
  finalPrice: number;
  discountPercentage: number | null; // Відсоток для бейджа
}

export function calculateDiscountInfo(
  basePrice: number,
  activeDiscount: Discount | null | undefined
): DiscountCalculationResult {
  // Якщо немає знижки, повертаємо оригінальну ціну без відсотка
  if (!activeDiscount || !activeDiscount.discount_percentage) {
    return {
      finalPrice: basePrice,
      discountPercentage: null,
    };
  }

  // Отримуємо відсоток знижки як ціле число
  const discountPercentage = Number(activeDiscount.discount_percentage);

  // Якщо відсоток знижки не більше 0, знижки немає
  if (discountPercentage <= 0) {
    return {
      finalPrice: basePrice,
      discountPercentage: null,
    };
  }

  // Розраховуємо знижену ціну: ціна - (ціна * знижка / 100)
  const finalPrice =
    basePrice - Math.floor((basePrice * discountPercentage) / 100);

  return {
    finalPrice: finalPrice,
    discountPercentage: discountPercentage,
  };
}
