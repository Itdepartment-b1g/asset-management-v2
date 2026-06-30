import "server-only";

import { NextResponse } from "next/server";
import { categoriesRepository } from "@/server/repositories/categories_repository";

type CategoryBody = { id?: string; title?: string };

export const categoriesController = {
  async list() {
    const categories = await categoriesRepository.findAll();
    return NextResponse.json(categories);
  },

  async getById(id: string) {
    const category = await categoriesRepository.findById(id);

    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    return NextResponse.json(category);
  },

  async create(body: CategoryBody) {
    const title = body.title?.trim();

    if (!title) {
      return NextResponse.json({ error: "title is required" }, { status: 400 });
    }

    const category = await categoriesRepository.create(title);
    return NextResponse.json(category, { status: 201 });
  },

  async update(body: CategoryBody) {
    const id = body.id?.trim();
    const title = body.title?.trim();

    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    if (!title) {
      return NextResponse.json({ error: "title is required" }, { status: 400 });
    }

    const existing = await categoriesRepository.findById(id);

    if (!existing) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    const category = await categoriesRepository.update(id, title);
    return NextResponse.json(category);
  },

  async remove(id: string) {
    const existing = await categoriesRepository.findById(id);

    if (!existing) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    await categoriesRepository.delete(id);
    return NextResponse.json({ success: true });
  },

  missingId() {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  },
};
