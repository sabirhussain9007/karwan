import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import connectToDatabase from "@/lib/mongoose";
import User from "@/models/User";
import { resolveAvatarInput } from "@/lib/avatar.server";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const user = await User.findById((session.user as any).id)
      .select("-password")
      .lean();
    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const body = await request.json();

    const userId = (session.user as any).id;

    if (body.avatar !== undefined) {
      try {
        body.avatar = await resolveAvatarInput(body.avatar, userId);
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Invalid avatar image";
        return NextResponse.json({ error: message }, { status: 400 });
      }
    }

    const user = await User.findByIdAndUpdate(
      userId,
      body,
      { new: true }
    ).select("-password").lean();

    return NextResponse.json(user);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update profile" },
      { status: 500 }
    );
  }
}
