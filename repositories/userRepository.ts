import prismaDb from "../prisma/prisma";
import { LoginUser, UpdateUser, User, createUser } from "../types/types";
import { handleServiceError, RepositoryError } from "../utils/errors";
import createRepository from "./baseRepository";
import { comparePassword, hashPassword } from "../utils/hashPassword";
import { ChangePassword } from "../routes/userRoutes";
const userRepository = createRepository<User, createUser, UpdateUser, "users">(
  "users"
);

const LoginUser = async (user: LoginUser): Promise<User> => {
  try {
    const data = await handleServiceError(
      () =>
        prismaDb.users.findUnique({
          where: { email: user.email },
        }),
      ""
    );
    if (!data) {
      throw new RepositoryError(`Не правильно введені пароль або  email`);
    }
    const isCorrect = await comparePassword(
      user.password_hash,
      data.password_hash
    );

    if (!isCorrect)
      throw new RepositoryError(`Не правильно введені пароль або  email`);
    return data;
  } catch (error: any) {
    throw new RepositoryError(`Не правильно введені пароль або  email`, error);
  }
};

async function changeUserPassword(
  dto: ChangePassword,
  userId: number
): Promise<User | string> {
  const user = await prismaDb.users.findUnique({
    where: { id: userId },
    select: { password_hash: true },
  });
  if (!user) {
    throw new RepositoryError(`Користувача з id=${userId} не знайдено.`);
  }

  const isMatch = await comparePassword(
    dto.currentPassword,
    user.password_hash
  );

  if (!isMatch) {
    throw new RepositoryError(`Невірний поточний пароль.`);
  }
  // 3. Захешувати новий пароль
  const newHash = await hashPassword(dto.newPassword);

  // 4. Оновити запис у базі
  try {
    const updated = await prismaDb.users.update({
      where: { id: userId },
      data: { password_hash: newHash, updated_at: new Date() },
    });
    return updated;
  } catch (err: any) {
    throw new RepositoryError(`Не вдалося оновити пароль користувача.`, err);
  }
}

export default {
  ...userRepository,
  LoginUser,
  changeUserPassword,
};
