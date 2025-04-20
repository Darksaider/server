import { Elysia } from "elysia";
import { productService } from "../services/AddProduct";
import {
  uploadMultipleImages,
  deleteMultipleImages,
  uploadImage,
} from "../services/ImageService";
import {
  ProductApiRequest,
  UploadResult,
  UploadSuccessResult,
} from "../types/types";

export const AddProductRoutes = new Elysia()
  .post("/newproducts", async ({ body, set }) => {
    const data = body as ProductApiRequest;

    try {
      const productData = JSON.parse(data.productData);

      let uploadedImages: UploadResult[] = [];
      const photos = Array.isArray(data.new_photos)
        ? data.new_photos
        : data.new_photos
          ? [data.new_photos]
          : [];

      if (photos && photos.length > 0) {
        if (photos.length === 1) {
          const result = await uploadImage(photos[0], "products");
          if (result.success) {
            uploadedImages = [
              {
                success: result.success,
                url: result.url,
                public_id: result.public_id,
              },
            ];
          } else {
            uploadedImages = [];
          }
        } else {
          uploadedImages = await uploadMultipleImages(photos, "products");
        }
      }

      const productWithImages = {
        ...productData,
        product_photos: uploadedImages
          .filter((img) => img.success)
          .map((img) => ({
            photo_url: img.url,
            cloudinary_public_id: img.public_id,
          })),
      };

      const newProduct =
        await productService.createProductWithRelations(productWithImages);

      set.status = 201;
      return {
        message: "Product created successfully!",
        product: newProduct,
      };
    } catch (error: unknown) {
      console.error("Error in POST /products:", error);
      if (
        error instanceof Error &&
        error.message === "Неправильний формат файлу"
      ) {
        console.error(
          "Possible cause: Trying to pass an array to uploadImage instead of a single File."
        );
      }
      set.status = 500;
      return {
        message: "Failed to create product",
        error: error instanceof Error ? error.message : String(error),
      };
    }
  })
  .put("/newproducts/:id", async ({ params, body, set }) => {
    try {
      const id = +params.id;
      const data = body as ProductApiRequest;
      if (isNaN(id)) {
        set.status = 400;
        return { message: "Invalid product ID" };
      }

      // Обробка видалення фотографій
      let deletedPhotoIds: string[] = [];
      if (data.photos_to_delete) {
        const photosToDelete =
          typeof data.photos_to_delete === "string"
            ? JSON.parse(data.photos_to_delete)
            : data.photos_to_delete;

        if (Array.isArray(photosToDelete)) {
          deletedPhotoIds = photosToDelete.filter(
            (id) => typeof id === "string"
          );

          if (deletedPhotoIds.length > 0) {
            console.log("Deleting images with public IDs:", deletedPhotoIds);
            await deleteMultipleImages(deletedPhotoIds);
          }
        }
      }

      // Парсинг даних продукту
      const productData =
        typeof data.productData === "string"
          ? JSON.parse(data.productData)
          : data.productData;

      let newUploadedImages: UploadResult[] = []; // Ініціалізуємо пустим масивом
      const photos = Array.isArray(data.new_photos)
        ? data.new_photos
        : data.new_photos
          ? [data.new_photos]
          : [];

      if (photos.length > 0) {
        if (photos.length === 1) {
          const result = await uploadImage(photos[0], "products");
          newUploadedImages = result.success
            ? [
                {
                  success: result.success,
                  url: result.url,
                  public_id: result.public_id,
                },
              ]
            : [];
        } else {
          newUploadedImages = await uploadMultipleImages(photos, "products");
        }
      }

      // Додавання інформації про нові зображення та видалені зображення до даних продукту
      const productWithImages = {
        ...productData,
        new_product_photos: newUploadedImages
          .filter((img) => img.success)
          .map((img) => ({
            photo_url: img.url,
            cloudinary_public_id: img.public_id,
          })),
        photos_to_delete: deletedPhotoIds, // Додаємо інформацію про видалені фото
      };

      console.log("Updating product with data:", productWithImages);

      const updatedProduct = await productService.updateProductWithRelations(
        id,
        productWithImages
      );

      set.status = 200;
      return {
        message: "Product updated successfully!",
        product: updatedProduct,
      };
    } catch (error: unknown) {
      console.error("Error in PUT /newproducts/:id:", error);
      set.status = 500;
      return {
        message: "Failed to update product",
        error: error instanceof Error ? error.message : String(error),
      };
    }
  });
