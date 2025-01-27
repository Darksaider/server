import Elysia from "elysia";
import brandService from "../services/BrandService";
import { CreateBrand } from "../types/types";
export const brandRoutes = new Elysia();
brandRoutes.get("/getBrands", async (context) => {
  const { set } = context;
  try {
    const brands = await brandService.getBrands();
    if (!brands) {
      set.status = 404;
      return { message: "Brands not found" };
    }
    return brands;
  } catch (error: any) {
    console.error("Error in route /brands:", error);
    set.status = 500;
    return { message: error.message || "Failed to fetch brands" };
  }
});
brandRoutes.post("/createBrand", async ({ body }) => {
  const data = body as CreateBrand;
  try {
    const newBrand = await brandService.createBrand(data);
    return {
      success: true,
      message: "Brand created successfully",
      data: { ...newBrand },
    };
  } catch (error) {
    console.error("Error creating brand:", error);
    return {
      success: false,
      message: "Failed to create brand",
      error: error,
    };
  }
});
