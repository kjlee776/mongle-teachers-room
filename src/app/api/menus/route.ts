import { NextResponse } from "next/server";
import { turso } from "@/lib/db";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const result = await turso.execute("SELECT * FROM menus ORDER BY id ASC");
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("Failed to fetch menus", error);
    return NextResponse.json({ error: "Failed to fetch menus" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { title, url, type } = await request.json();

    if (!title || !url || !type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const result = await turso.execute({
      sql: "INSERT INTO menus (title, type, url) VALUES (?, ?, ?)",
      args: [title, type, url]
    });

    return NextResponse.json({ id: Number(result.lastInsertRowid), title, type, url }, { status: 201 });
  } catch (error) {
    console.error("Failed to create menu", error);
    return NextResponse.json({ error: "Failed to create menu" }, { status: 500 });
  }
}
