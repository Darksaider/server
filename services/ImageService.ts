import cloudinary from "../src/cloudinary";
import { UploadResult } from "../types/types";

export const uploadImage = async (
  file: File,
  folder = "elysia_uploads"
): Promise<UploadResult> => {
  try {
    if (!file || typeof file.arrayBuffer !== "function") {
      throw new Error("Неправильний формат файлу");
    }

    const buffer = await file.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");
    const dataUrl = `data:${file.type};base64,${base64}`;

    const result = await cloudinary.uploader.upload(dataUrl, {
      folder,
    });

    return {
      success: true,
      url: result.secure_url,
      public_id: result.public_id,
    };
  } catch (error: any) {
    console.error("Помилка при завантаженні зображення:", error.message);
    return {
      success: false,
      message: error.message || "Невідома помилка при завантаженні",
    };
  }
};

export const uploadMultipleImages = async (
  files: File[],
  folder = "elysia_uploads"
): Promise<UploadResult[]> => {
  const results: UploadResult[] = [];

  for (const file of files) {
    const result = await uploadImage(file, folder);
    results.push(result);
  }

  return results;
};

// Модифікація функції deleteImage для кращої обробки помилок
export const deleteImage = async (
  publicId: string
): Promise<{
  success: boolean;
  message?: string;
}> => {
  try {
    // Переконайтеся, що publicId не пустий
    if (!publicId) {
      return {
        success: false,
        message: "Public ID не може бути пустим",
      };
    }

    console.log(`Спроба видалити зображення з ID: ${publicId}`);
    const result = await cloudinary.uploader.destroy(publicId);
    console.log(`Результат видалення для ${publicId}:`, result);

    if (result.result === "ok") {
      return {
        success: true,
      };
    } else if (result.result === "not found") {
      return {
        success: false,
        message: `Зображення з ID ${publicId} не знайдено в Cloudinary`,
      };
    } else {
      return {
        success: false,
        message: `Помилка видалення: ${result.result}`,
      };
    }
  } catch (error: any) {
    console.error(`Помилка при видаленні зображення ${publicId}:`, error);
    return {
      success: false,
      message: error.message || "Невідома помилка при видаленні",
    };
  }
};
export const deleteMultipleImages = async (
  publicIds: string[]
): Promise<{
  success: boolean;
  results?: { publicId: string; success: boolean; message?: string }[];
  message?: string;
}> => {
  try {
    if (!publicIds || publicIds.length === 0) {
      return {
        success: false,
        message: "Не надано жодного ID для видалення",
      };
    }

    const results = [];

    for (const publicId of publicIds) {
      const result = await deleteImage(publicId);
      results.push({
        publicId,
        success: result.success,
        message: result.message,
      });
    }

    const allSuccessful = results.every((result) => result.success);

    return {
      success: allSuccessful,
      results,
      message: allSuccessful
        ? `Успішно видалено всі ${publicIds.length} зображень`
        : `Деякі зображення не вдалося видалити`,
    };
  } catch (error: any) {
    console.error("Помилка при видаленні кількох зображень:", error.message);
    return {
      success: false,
      message: error.message || "Невідома помилка при масовому видаленні",
    };
  }
};
