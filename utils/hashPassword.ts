
import bcrypt from 'bcrypt'
export async function hashPassword(password: string) {
  // Генеруємо "сіль" (salt). Параметр rounds визначає складність.
  // Чим більше rounds, тим складніше зламати хеш, але й довше хешування.
  const saltRounds = 10;
  const salt = await bcrypt.genSalt(saltRounds);

  // Хешуємо пароль разом із сіллю
  const hash = await bcrypt.hash(password, salt);

  // Повертаємо хеш
  return hash;
}

export async function comparePassword(password: string, hashedPassword: string) {
  // Порівнюємо введений пароль із хешованим паролем з бази даних
  const match = await bcrypt.compare(password, hashedPassword);

  // Повертаємо true, якщо паролі збігаються, і false - інакше
  return match;
}