import { createUser, UpdateUser, User, LoginUser } from "../types/types";
import { createUserSchema } from "../prisma/schemas";
import createService from "./baseService";
import userRepository from "../prisma/repositories/userRepository";
import { Context } from "elysia"; // Імпортуємо Context з Elysia

// Розширюємо тип Context, щоб включити jwt
export interface ElysiaContext extends Context {
  jwt: {
    sign: (payload: object) => Promise<string>;
  };
}

const userService = createService<User>(userRepository);

// Оголошуємо тип для payload
interface JwtPayload {
  id: number;
  email: string;
  role: string;
}

// Використовуємо Elysia для створення JWT
const loginUser = async (user: LoginUser, ctx: ElysiaContext): Promise<string> => {
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

  // Використовуємо ctx.jwt для підпису токена
  const token = await ctx.jwt.sign(payload); // ctx.jwt вже доступний
  return token;
};

const createUser = async (user: createUser): Promise<User> => {
  return await userService.create(createUserSchema, user);
};

const updateUser = async (
  id: number | string,
  user: UpdateUser
): Promise<User | null> => {
  const updatedUserSchema = createUserSchema.partial();
  return await userService.update(updatedUserSchema, id, user);
};

export default {
  ...userService,
  createUser,
  updateUser,
  loginUser,
};
