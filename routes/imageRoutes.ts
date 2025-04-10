import { Elysia } from "elysia";
import { readMultipart } from "@elysiajs/multipart";
import cloudinary from "../";

const app = new Elysia();

app.post("/upload-product", async ({ body }) => {
  try {
    const formData = await readMultipart(body);
    if (!formData) {
      return { error: "No files uploaded" };
    }

    // Отримання текстових полів
    const name = formData.fields.name;
    const description = formData.fields.description;
    const price = parseFloat(formData.fields.price);
    const category = formData.fields.category;

    // Завантаження зображень
    const imageUploadPromises = formData.files.map((file) => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "products" },
          (error, uploadResult) => {
            if (error) reject(error);
            else resolve(uploadResult.secure_url);
          }
        );
        stream.end(file.data);
      });
    });

    const imageUrls = await Promise.all(imageUploadPromises);

    // Новий продукт
    const newProduct = {
      name,
      description,
      price,
      category,
      images: imageUrls,
    };

    return { message: "Product uploaded successfully", product: newProduct };
  } catch (error) {
    return { error: "Upload failed" };
  }
});

export default app;
