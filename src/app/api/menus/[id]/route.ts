import { NextResponse } from "next/server";
import { turso } from "@/lib/db";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await turso.execute({
      sql: "DELETE FROM menus WHERE id = ?",
      args: [id]
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete menu", error);
    return NextResponse.json({ error: "Failed to delete menu" }, { status: 500 });
  }
}
