import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { password } = await request.json();

    // A simple password check against env password
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (password === adminPassword) {
      // Return a successful response, perhaps setting a cookie in a real app
      // For this sample app, just returning success is fine since state is in client React
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ success: false, error: "Invalid password" }, { status: 401 });
    }
  } catch (_) {
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
