import { Elysia } from "elysia";
import { authRoutes } from "../routes/authRoutes";
import { disconnectDb } from "../prisma/prisma";
import { userRoutes } from "../routes/userRoutes";
import { sizeRoutes } from "../routes/sizeRoutes";
import { brandRoutes } from "../routes/brandRoutes";
import { productRoutes } from "../routes/productRoutes";
import { cookie } from "@elysiajs/cookie";
import { discountRoutes } from "../routes/discountRoutes";
import cors from "@elysiajs/cors";
import { colorRoutes } from "../routes/colorRoutes";
import { tagRoutes } from "../routes/tagRoutes";
import jwtMiddleware from "../Middleware/JwtMiddleware";
import { AddProductRoutes } from "../routes/productsRoutes";
import { categoryRoutes } from "../routes/categoryRoutes";

const app = new Elysia();

app.use(
  cors({
    origin: "http://localhost:5173", // Your frontend origin
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(cookie());
app.use(jwtMiddleware);
app.use(authRoutes);
app.use(userRoutes);
app.use(sizeRoutes);
app.use(brandRoutes);
app.use(productRoutes);
app.use(discountRoutes);
app.use(colorRoutes);
app.use(tagRoutes);
app.use(AddProductRoutes);
app.use(categoryRoutes);

app.onStop(disconnectDb);
app.listen(3000, () => console.log("Server listening on port 3000 🚀"));
