// user.service.ts
import { createUser, UpdateUser, User } from "../types/types";
import { createUserSchema } from "../bd/prisma/schemas";
import createService from "./baseService";
import createRepository from "../repositories/baseRepository";
const userRepository = createRepository<User, createUser, UpdateUser, "users">(
  "users",
);
const userService = createService<User>(userRepository);

const createUser = async (user: createUser): Promise<User> => {
  return await userService.create(createUserSchema, user);
};
const updateUser = async (
  id: number | string,
  user: UpdateUser,
): Promise<User | null> => {
  const updatedUserSchema = createUserSchema.partial();
  return await userService.update(updatedUserSchema, id, user);
};

export default {
  ...userService,
  createUser,
  updateUser,
};
