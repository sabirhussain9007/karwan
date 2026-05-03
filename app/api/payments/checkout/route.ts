import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import connectToDatabase from "@/lib/mongoose";
import Booking from "@/models/Booking";
import Stripe from "stripe";

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16" as any,
}) : null;

export async function POST(request: NextRequest) {
  try {
    if (!stripe) {
      return NextResponse.json({ error: "Stripe not configured" }, { status: 500 });
    }

    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const body = await request.json();
    const { packageId, serviceType, amount, passengers, specialRequests, travelDate } = body;

    // Create Stripe checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: serviceType,
              description: `Booking for ${serviceType}`,
            },
            unit_amount: Math.round(amount * 100),
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.NEXTAUTH_URL}/booking-confirmation?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXTAUTH_URL}/${serviceType.toLowerCase().replace(/\s+/g, "-")}`,
      metadata: {
        userId: (session.user as any).id,
        packageId,
        serviceType,
        passengers,
        travelDate,
      },
    });

    // Create a pending booking
    const booking = new Booking({
      user: (session.user as any).id,
      packageId: packageId || null,
      serviceType,
      status: "Pending",
      paymentStatus: "Unpaid",
      totalAmount: amount,
      bookingDate: new Date(),
      passengers,
      specialRequests,
      travelDate: travelDate ? new Date(travelDate) : null,
      stripeSessionId: checkoutSession.id,
    });

    await booking.save();

    return NextResponse.json({
      sessionId: checkoutSession.id,
      bookingId: booking._id,
      url: checkoutSession.url,
    });
  } catch (error: any) {
    console.error("Payment error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create payment session" },
      { status: 500 }
    );
  }
}
