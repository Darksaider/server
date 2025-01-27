import prismaDb from "../bd/prisma/prisma";
import { Color, CreateColor } from "../types/types";

const createColor = async (color: CreateColor): Promise<Color | null> => {
  try {
    const newColor = await prismaDb.colors.create({ data: color });
    return newColor;
  } catch (error) {
    console.log("Error creating color:", error);
    return null;
  }
};
const removeColor = async (id: number): Promise<Color | null> => {
  try {
    const color = await prismaDb.colors.delete({ where: { id } });
    return color;
  } catch (error) {
    console.log("Error removing color:", error);
    return null;
  }
};
export default { createColor, removeColor };
