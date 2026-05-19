import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import connectToDatabase from "@/lib/mongoose";
import User from "@/models/User";
import { resolveAvatarInput } from "@/lib/avatar.server";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const user = await User.findById((session.user as { id: string }).id)
      .select("-password")
      .lean();

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch {
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
    const userId = (session.user as { id: string }).id;

    const updates: Record<string, unknown> = {};

    if (body.name !== undefined) {
      const name = String(body.name).trim();
      if (!name) {
        return NextResponse.json({ error: "Name is required" }, { status: 400 });
      }
      updates.name = name;
    }

    if (body.bio !== undefined) {
      updates.bio = String(body.bio).trim().slice(0, 500);
    }

    if (body.travelPreferences !== undefined) {
      updates.travelPreferences = Array.isArray(body.travelPreferences)
        ? body.travelPreferences.map((p: string) => String(p).trim()).filter(Boolean)
        : String(body.travelPreferences)
            .split(",")
            .map((p) => p.trim())
            .filter(Boolean);
    }

    if (body.avatar !== undefined) {
      try {
        updates.avatar = await resolveAvatarInput(body.avatar, userId);
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Invalid avatar image";
        return NextResponse.json({ error: message }, { status: 400 });
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
    }

    const user = await User.findByIdAndUpdate(userId, updates, { new: true })
      .select("-password")
      .lean();

    return NextResponse.json(user);
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to update profile";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
