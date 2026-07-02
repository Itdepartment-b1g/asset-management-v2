import "server-only";

import { prisma } from "@/server/prisma/client";

export type CreateUserData = {
  id: string;
  email?: string | null;
  full_name?: string | null;
};

export const authRepository = {
  findById(id: string) {
    return prisma.user.findUnique({ where: { id } });
  },

  create({ id, email, full_name }: CreateUserData) {
    return prisma.user.create({
      data: { id, email, full_name },
    });
  },

  upsertFromAuth({ id, email, full_name }: CreateUserData) {
    return prisma.user.upsert({
      where: { id },
      create: { id, email, full_name },
      update: { email, full_name },
    });
  },
};
