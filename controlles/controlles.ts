import { NotFoundError } from "elysia";
import prismaDb from "../bd/prisma/prisma";
import { createUserType } from "../types/types";

// export const getUser = async () => {
//   try {
//     const res = await prismaDb.users.findMany();
//     return res;
//   } catch (error) {
//     console.error("Error finding filter users:", error);
//   }
// };

// export const createUser = async (body: createUserType) => {
//   try {
//     console.log();
//     const { avatar_url, ...data } = body;
//     console.log(data);

//     const newUser = await prismaDb.users.create({
//       data: {
//         avatar_url,
//         ...data,
//       },
//     });
//     return newUser;
//   } catch (error: any) {
//     console.error("Error creating user:", error);
//     throw new Error(error.message || "Failed to create user");
//   }
// };
export const findUser = async (id: number) => {
  try {
    const user = await prismaDb.users.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundError("User not found!");
    }
    return user;
  } catch (e) {
    console.log("Error finding user", e);
  }
};

export const createSize = async (size: string) => {
  try {
    const newUser = await prismaDb.sizes.create({
      data: {
        size: size,
      },
    });
    return newUser;
  } catch (error: any) {
    console.error("Error creating sizes:", error);
    throw new Error(error.message || "Failed to create size");
  }
};
export const getSize = async () => {
  try {
    const sizes = await prismaDb.sizes.findMany();
    if (!sizes) {
      return sizes;
    }
  } catch (error: any) {
    console.error("Error", error.message);
  }
};
