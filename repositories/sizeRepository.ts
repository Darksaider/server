import prismaDb from "../bd/prisma/prisma";
import { Size, CreateSize } from "../types/types";
import createRepository from "./baseRepository";
const sizeRepository = createRepository<Size, CreateSize, {}, "sizes">("sizes");

export default { ...sizeRepository };
