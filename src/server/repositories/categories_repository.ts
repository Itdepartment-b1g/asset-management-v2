import "server-only";

import { prisma } from "@/server/prisma/client";

export const categoriesRepository = {
  findAll() {
    return prisma.categories.findMany({
      orderBy: { created_at: "desc" },
    });
  },

  findById(id: string) {
    return prisma.categories.findUnique({ where: { id } });
  },

  create(title: string) {
    return prisma.categories.create({ data: { title } });
  },

  update(id: string, title: string) {
    return prisma.categories.update({
      where: { id },
      data: { title },
    });
  },

  delete(id: string) {
    return prisma.categories.delete({ where: { id } });
  },
};
