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
import { favoritesRoutes } from "../routes/favoriteRoutes";
import { cartRoutes } from "../routes/cartRoutes";
import { uploadRoutes } from "../routes/ImageRouter";
import { orderRoutes } from "../routes/orderRoutes";
import { stripeRoutes } from "../routes/stripeRoutes";
import { commentRoutes } from "../routes/commentRoutes";

const app = new Elysia();

app.use(
  cors({
    origin: "http://localhost:5173", // ВАШ ФРОНТЕНД URL
    credentials: true, // Дозволити надсилати куки
    allowedHeaders: ["Content-Type" /* 'Authorization', */], // Дозволені заголовки
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // Дозволені методи
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
app.use(favoritesRoutes);
app.use(cartRoutes);
app.use(uploadRoutes);
app.use(orderRoutes);
app.use(stripeRoutes);
app.use(commentRoutes);

app.onStop(disconnectDb);
app.listen(3000, () => console.log("Server listening on port 3000 🚀"));
