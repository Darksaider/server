import { UpdateUser, User, createUser } from "../types/types";
import createRepository from "./baseRepository";
const userRepository = createRepository<User, createUser, UpdateUser, "users">(
  "users",
);

export default {
  ...userRepository,
};
