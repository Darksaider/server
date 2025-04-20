// src/routes/upload.routes.ts
import { Elysia } from "elysia";
import { uploadFileToCloudinary } from "../services/ImageServices";
import {
  uploadMultipleBodySchema,
  uploadSingleBodySchema,
} from "../prisma/schemas";

export const uploadRoutes = new Elysia({ prefix: "/upload" })
  // --- Маршрут для завантаження ОДНОГО файлу ---
  .post(
    "/single",
    async ({ body, set }) => {
      console.log("Отримано запит на /upload/single");
      const file = body.image; // 'image' з uploadSingleBodySchema

      const result = await uploadFileToCloudinary(
        file,
        "elysia_uploads_single"
      ); // Виклик сервісу

      if (!result.success) {
        set.status = 500; // Internal Server Error (або 400, залежно від помилки)
        return { success: false, message: result.message };
      }

      return result; // Повертаємо успішний результат
    },
    {
      body: uploadSingleBodySchema, // Використовуємо схему валідації
    }
  )

  .post(
    "/multiple",
    async ({ body, set }) => {
      console.log("Отримано запит на /upload/multiple");
      const files = body.images;

      console.log(`Отримано ${files.length} файлів для завантаження.`);

      const uploadPromises = files.map((file) =>
        uploadFileToCloudinary(file, "elysia_uploads_multiple")
      );

      const results = await Promise.allSettled(uploadPromises);

      const successfulUploads: any[] = [];
      const uploadErrors: any[] | undefined = [];

      results.forEach((result, index) => {
        const originalFileName = files[index]?.name || `файл #${index + 1}`;

        if (result.status === "fulfilled") {
          if (result.value.success) {
            successfulUploads.push(result.value);
          } else {
            uploadErrors.push({
              filename: result.value.original_filename,
              error: result.value.message,
            });
          }
        } else {
          uploadErrors.push({
            filename: originalFileName,
            error: result.reason?.message || "Не вдалося обробити завантаження",
          });
        }
      });

      console.log(
        `Успішно завантажено: ${successfulUploads.length}, Помилок: ${uploadErrors.length}`
      );

      if (successfulUploads.length === 0 && uploadErrors.length > 0) {
        set.status = 500;
        return {
          success: false,
          message: "Не вдалося завантажити жоден файл.",
          errors: uploadErrors,
        };
      }

      return {
        success: true,
        message: `Завантажено ${successfulUploads.length} з ${files.length} файлів.`,
        results: successfulUploads,
        errors: uploadErrors.length > 0 ? uploadErrors : undefined,
      };
    },
    {
      body: uploadMultipleBodySchema, // Використовуємо схему валідації
    }
  );

console.log("Роути завантаження (/upload/single, /upload/multiple) визначено.");
