declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: "development" | "production" | "test";
    CLIENT_URL: string;
    SERVER_URL: string;
    GOOGLE_CLIENT_ID: string;
    GOOGLE_CLIENT_SECRET: string;
    GOOGLE_REDIRECT_URI: string;
    DATABASE_URL: string;
    // Додайте сюди інші змінні, які ви використовуєте
  }
}
