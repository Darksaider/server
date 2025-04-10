import { CreateTag, createUser, Tag, UpdateUser, User } from "../types/types";
import { createTagSchema } from "../prisma/schemas";
import createService from "./baseService";
import createRepository from "../prisma/repositories/baseRepository";
const tagRepository = createRepository<Tag, CreateTag, {}, "tags">(
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
