import { createUser, UpdateUser, User, LoginUser } from "../types/types";
import { createUserSchema } from "../prisma/schemas";
import createService from "./baseService";
import userRepository from "../repositories/userRepository";
import { Context } from "elysia";
import { ChangePassword } from "../routes/userRoutes";
import { uploadImage } from "./ImageService";

// Розширюємо тип Context, щоб включити jwt
export interface ElysiaContext extends Context {
  jwt: {
    sign: (payload: object) => Promise<string>;
  };
}

const userService = createService<User>(userRepository);
interface JwtPayload {
  id: number;
  email: string;
  role: string;
}

// Використовуємо Elysia для створення JWT
const loginUser = async (user: LoginUser, ctx: ElysiaContext) => {
  const existingUser = await userRepository.LoginUser(user);

  if (!existingUser) {
    throw new Error("Invalid credentials");
  }
  const role = existingUser.role || "customer";
  // Створюємо payload з правильним типом
  const payload: JwtPayload = {
    id: existingUser.id,
    email: existingUser.email,
    role: role,
  };

  const token = await ctx.jwt.sign(payload);
  const data = {
    user: {
      ...payload,
    },
    token: token,
  };
  return data;
};

const createUser = async (user: createUser): Promise<User> => {
  return await userService.create(createUserSchema, user);
};

// const updateUser = async (
//   id: number | string,
//   user: UpdateUser
// ): Promise<User | null> => {
//   let uploadIm;
//   if (user.avatar_url) uploadIm = await uploadImage(user.avatar_url, "avatars");

//   const updatedUserSchema = createUserSchema.partial();
//   return await userService.update(updatedUserSchema, id, {
//     ...user,
//     avatar_url: uploadIm.url,
//   });
// };
export const updateUser = async (
  id: number | string,
  userData: UpdateUser
): Promise<User | null> => {
  const updatedFields: Partial<UpdateUser> = { ...userData };
  const updatedUserSchema = createUserSchema.partial();

  if (userData.avatar_url) {
    try {
      const uploadedImage = await uploadImage(userData.avatar_url, "avatars");
      updatedFields.avatar_url = uploadedImage.url;
    } catch (error) {
      console.error("Помилка при завантаженні зображення:", error);
      throw new Error("Не вдалося завантажити аватар");
    }
  }

  const validatedData = createUserSchema.partial().parse(updatedFields);

  return await userService.update(updatedUserSchema, id, validatedData);
};
const updataPassword = async (newPassword: ChangePassword, id: number) => {
  return await userRepository.changeUserPassword(newPassword, id);
};

export default {
  ...userService,
  createUser,
  updateUser,
  loginUser,
  updataPassword,
};
