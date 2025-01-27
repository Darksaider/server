import { Elysia } from "elysia";
import { authRoutes } from "../routes/authRoutes";
import { disconnectDb } from "../bd/prisma/prisma";
import { userRoutes } from "../routes/userRoutes";
import { sizeRoutes } from "../routes/sizeRoutes";
import { brandRoutes } from "../routes/brandRoutes";
import { productRoutes } from "../routes/productRoutes";
const app = new Elysia();

app.use(authRoutes);
app.use(userRoutes);
app.use(sizeRoutes);
app.use(brandRoutes);
app.use(productRoutes);
app.onStop(disconnectDb);
app.listen(3000, () => console.log("Server listening on port 3000 🚀"));
