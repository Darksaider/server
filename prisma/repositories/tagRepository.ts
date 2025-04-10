import prismaDb from "../prisma";
import { Tag, CreateTag } from "../../types/types";
import createRepository from "./baseRepository";
const tagBaseRepository = createRepository<Tag, CreateTag, {}, "tags">("tags");

export default {
  ...tagBaseRepository,
};
