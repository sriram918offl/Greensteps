"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { indexDocument } from "@/lib/rag";

export async function addDocument(formData: FormData) {
  await requireAdmin();
  const title = String(formData.get("title"));
  const source = String(formData.get("source") ?? "");
  const category = String(formData.get("category") ?? "general");
  const content = String(formData.get("content"));

  const doc = await prisma.document.create({
    data: { title, source, category, content },
  });

  try {
    await indexDocument(doc.id, content);
  } catch (e) {
    console.error("Embedding failed", e);
  }

  revalidatePath("/admin/knowledge");
}

export async function reindexDocument(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const doc = await prisma.document.findUnique({ where: { id } });
  if (!doc) return;
  await indexDocument(doc.id, doc.content);
  revalidatePath("/admin/knowledge");
}

export async function deleteDocument(formData: FormData) {
  await requireAdmin();
  await prisma.document.delete({ where: { id: String(formData.get("id")) } });
  revalidatePath("/admin/knowledge");
}
