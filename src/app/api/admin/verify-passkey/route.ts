import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { passkey } = await req.json();

    if (passkey !== process.env.ADMIN_SECRET) {
      return NextResponse.json(
        { success: false, error: "Invalid Secret Admin Passkey!" },
        { status: 401 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid Secret Admin Passkey!" },
      { status: 401 }
    );
  }
}
