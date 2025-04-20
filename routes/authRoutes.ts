import { Elysia } from "elysia";

import {
  googleAuthControllerCallback,
  googleAuthControllerLogin,
} from "../controles/authControlles";
export const authRoutes = new Elysia();

authRoutes.get("/auth/google/callback", googleAuthControllerCallback);
authRoutes.get("/auth/google/login", googleAuthControllerLogin);
authRoutes.get("/auth/google/logout", googleAuthControllerLogin);

// authRoutes.post()
