import { PrismaClient } from "@prisma/client";

const prismaDb = new PrismaClient();

export default prismaDb;

export async function disconnectDb() {
  try {
    await prismaDb.$disconnect();
    console.log("Disconnected from database");
  } catch (error) {
    console.error("Error disconnecting from database:", error);
  }
}
