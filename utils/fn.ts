export function parseFilterValue<T>(value: string, key: keyof T): any {
  try {
    const parsedValue = JSON.parse(value);

    if (typeof parsedValue === "object" && parsedValue !== null) {
      return parsedValue;
    } else {
      return parsedValue;
    }
  } catch (e) {
    return value as any;
  }
}

export function parseNestedFilter<T>(
  urlParams: URLSearchParams,
  parseValue: (value: string, key: string) => any,
): any {
  const filter: any = {};

  for (const [key, value] of urlParams.entries()) {
    const keys = key.split(".");
    let current = filter;

    for (let i = 0; i < keys.length - 1; i++) {
      const k = keys[i];
      if (!current[k]) {
        current[k] = {};
      }
      current = current[k];
    }
    const parsedValue = parseValue(value, keys[keys.length - 1]);
    if (keys[keys.length - 1] in current) {
      current[keys[keys.length - 1]] = parsedValue;
    }
  }
  return filter;
}

export function parsePrismaQuery(query: string): Record<string, any> {
  const result: Record<string, any> = {};

  query.split("&").forEach((part) => {
    const [path, value] = part.split("=");
    const keys = path.split("."); // Розбиваємо шлях на ключі

    let current = result;
    keys.forEach((key, index) => {
      if (index === keys.length - 1) {
        // Якщо останній ключ
        if (key === "OR" || key === "AND") {
          // Для операторів OR/AND значення завжди є масивом
          current[key] = value.split(";").map((cond) => parsePrismaQuery(cond));
        } else if (
          [
            "equals",
            "gt",
            "lt",
            "gte",
            "lte",
            "contains",
            "in",
            "notIn",
            "startsWith",
            "endsWith",
          ].includes(key)
        ) {
          // Обробляємо оператори Prisma
          current[key] = value.includes(",")
            ? value.split(",").map((v) => (isNaN(Number(v)) ? v : Number(v)))
            : isNaN(Number(value))
              ? value
              : Number(value);
        } else {
          // Просте значення
          current[key] = isNaN(Number(value)) ? value : Number(value);
        }
      } else {
        // Якщо це не останній ключ, створюємо вкладений об'єкт
        if (!current[key]) current[key] = {};
        current = current[key];
      }
    });
  });

  return result;
}
