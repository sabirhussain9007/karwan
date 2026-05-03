import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import connectToDatabase from "@/lib/mongoose";
import Booking from "@/models/Booking";
import Stripe from "stripe";

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16" as any,
}) : null;

export async function GET(request: NextRequest) {
  try {
    if (!stripe) {
      return NextResponse.json({ error: "Stripe not configured" }, { status: 500 });
    }

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("session_id");

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID required" },
        { status: 400 }
      );
    }

    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    // Get Stripe session info
    const stripeSession = await stripe.checkout.sessions.retrieve(sessionId);

    // Get booking
    const booking = await Booking.findOne({ stripeSessionId: sessionId });

    if (!booking) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      booking: {
        _id: booking._id,
        serviceType: booking.serviceType,
        status: booking.status,
        paymentStatus: booking.paymentStatus,
        totalAmount: booking.totalAmount,
        passengers: booking.passengers,
        bookingDate: booking.bookingDate,
        travelDate: booking.travelDate,
      },
      stripeStatus: stripeSession.payment_status,
    });
  } catch (error: any) {
    console.error("Confirmation error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to get booking confirmation" },
      { status: 500 }
    );
  }
}
