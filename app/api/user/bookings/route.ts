import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import connectToDatabase from "@/lib/mongoose";
import Booking from "@/models/Booking";
import { notifyNewBooking } from "@/lib/notifications";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const bookings = await Booking.find({ user: (session.user as any).id })
      .sort({ createdAt: -1 })
      .populate("package", "title price destination");
    return NextResponse.json(bookings);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch bookings" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const body = await request.json();

    const booking = new Booking({
      ...body,
      user: (session.user as any).id,
    });
    await booking.save();

    // Trigger email notification for new booking
    notifyNewBooking({
      user: { name: (session.user as any).name, email: (session.user as any).email },
      serviceType: booking.serviceType || "Custom Package Booking",
    });

    return NextResponse.json(booking, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to create booking" },
      { status: 500 }
    );
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
    const { id, ...updateData } = body;

    const booking = await Booking.findById(id);
    if (!booking || booking.user.toString() !== (session.user as any).id) {
      return NextResponse.json(
        { error: "Booking not found or unauthorized" },
        { status: 404 }
      );
    }

    Object.assign(booking, updateData);
    await booking.save();

    return NextResponse.json(booking);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update booking" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    const booking = await Booking.findById(id);
    if (!booking || booking.user.toString() !== (session.user as any).id) {
      return NextResponse.json(
        { error: "Booking not found or unauthorized" },
        { status: 404 }
      );
    }

    await Booking.findByIdAndDelete(id);

    return NextResponse.json({ message: "Booking deleted" });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete booking" },
      { status: 500 }
    );
  }
}
