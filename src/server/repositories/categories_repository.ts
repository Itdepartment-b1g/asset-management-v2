import "server-only";

import { prisma } from "@/server/prisma/client";

export const categoriesRepository = {
  findAll(userId: string) {
    return prisma.categories.findMany({
      where: { user_id: userId },
      orderBy: { created_at: "desc" },
    });
  },

  findById(id: string, userId: string) {
    return prisma.categories.findFirst({
      where: { id, user_id: userId },
    });
  },

  create(userId: string, title: string) {
    return prisma.categories.create({
      data: { user_id: userId, title },
    });
  },

  async update(id: string, userId: string, title: string) {
    const result = await prisma.categories.updateMany({
      where: { id, user_id: userId },
      data: { title },
    });

    if (result.count === 0) {
      return null;
    }

    return prisma.categories.findUnique({ where: { id } });
  },

  delete(id: string, userId: string) {
    return prisma.categories.deleteMany({
      where: { id, user_id: userId },
    });
  },
};
