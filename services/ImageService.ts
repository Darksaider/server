// src/services/cloudinary.service.ts
import type { UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';
import cloudinary from '../src/cloudinary';

interface ElysiaFile extends Blob {
  name: string;
}

// Тип для успішного результату
type UploadSuccessResult = {
  success: true;
  original_filename: string;
  url: string;
  public_id: string;
  format: string;
  resource_type: string;
};

// Тип для помилки
type UploadErrorResult = {
  success: false;
  original_filename: string;
  message: string;
};

/**
 * Завантажує один файл на Cloudinary.
 * @param file - Файл для завантаження (очікується тип, що надається Elysia для t.File).
 * @param folder - Опціональна папка на Cloudinary.
 * @returns Результат завантаження (успіх або помилка).
 */
export const uploadFileToCloudinary = async (
  file: ElysiaFile,
  folder: string = 'elysia_uploads' // Папка за замовчуванням
): Promise<UploadSuccessResult | UploadErrorResult> => {

  console.log(`[Service] Обробка файлу: ${file.name} (${file.size} байт)`);
  try {
    // Конвертація у Data URI
    const buffer = await file.arrayBuffer();
    const base64String = Buffer.from(buffer).toString('base64');
    const dataUri = `data:${file.type};base64,${base64String}`;

    console.log(`[Service] Завантаження файлу ${file.name} на Cloudinary до папки ${folder}...`);

    const result: UploadApiResponse = await cloudinary.uploader.upload(dataUri, {
      resource_type: 'auto', // Автоматично визначати тип
      folder: folder, // Використовуємо передану або дефолтну папку
      // Можна задати public_id на основі імені файлу, але будьте обережні з унікальністю
      // public_id: `${folder}/${Date.now()}-${file.name.split('.').slice(0, -1).join('.')}`,
    });

    console.log(`[Service] Успішно завантажено: ${file.name} -> ${result.secure_url}`);
    return {
      success: true,
      original_filename: file.name,
      url: result.secure_url,
      public_id: result.public_id,
      format: result.format,
      resource_type: result.resource_type,
    };
  } catch (error: unknown) {
    // Типізуємо помилку, яку повертає Cloudinary SDK
    const uploadError = error as UploadApiErrorResponse;
    const errorMessage = uploadError?.message || (error instanceof Error ? error.message : 'Невідома помилка під час завантаження');
    console.error(`[Service] Помилка завантаження файлу ${file.name}:`, errorMessage);
    return {
      success: false,
      original_filename: file.name,
      message: errorMessage,
    };
  }
};