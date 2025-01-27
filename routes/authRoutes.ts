import { Elysia } from "elysia";
import {
  googleAuthContollesLogin,
  googleAuthContollesCalback,
} from "../controlles/authControlles";
export const authRoutes = new Elysia();

authRoutes.get("/auth/google/login", googleAuthContollesLogin);

authRoutes.get("/auth/google/callback", googleAuthContollesCalback);
