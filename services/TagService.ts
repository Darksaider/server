import { CreateTag, createUser, Tag, UpdateUser, User } from "../types/types";
import { createTagSchema } from "../bd/prisma/schemas";
import createService from "./baseService";
import createRepository from "../repositories/baseRepository";
const tagRepository = createRepository<User, createUser, UpdateUser, "tags">(
  "tags",
);
const tagService = createService<Tag>(tagRepository);

const createTag = async (tag: CreateTag): Promise<Tag> => {
  return await tagService.create(createTagSchema, tag);
};
export default {
  ...tagService,
  createTag,
};
