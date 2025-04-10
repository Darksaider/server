import { password } from "bun";
import prismaDb from "../prisma";
import { LoginUser, UpdateUser, User, createUser } from "../../types/types";
import { handleServiceError, RepositoryError } from "../../utils/errors";
import createRepository from "./baseRepository";
import { comparePassword } from "../../utils/hashPassword";
const userRepository = createRepository<User, createUser, UpdateUser, "users">(
  "users",
);

const LoginUser = async (user: LoginUser): Promise<User> => {
  try {
    const data = await handleServiceError(() => prismaDb.users.findUnique({
      where: { email: user.email },
    }), "")
    if (!data) {
      throw new RepositoryError(
        `Не правильно введені пароль або  email`,
      );
    }
    const isCorrect = await comparePassword(user.password_hash, data.password_hash)

    if (!isCorrect)
      throw new RepositoryError(
        `Не правильно введені пароль або  email`,
      );
    return data

  } catch (error: any) {
    throw new RepositoryError(
      `Не правильно введені пароль або  email`,
      error,
    );
  }
}

export default {
  ...userRepository,
  LoginUser
};
