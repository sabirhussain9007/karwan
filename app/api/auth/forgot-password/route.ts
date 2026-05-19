import { NextResponse } from "next/server";
import crypto from "crypto";
import connectToDatabase from "@/lib/mongoose";
import User from "@/models/User";
import { sendPasswordResetEmail } from "@/lib/notifications";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { message: "Please provide an email address" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json(
        { message: "If that email exists in our system, we've sent a password reset link to it." },
        { status: 200 }
      );
    }

    // Generate token
    const resetToken = crypto.randomBytes(32).toString("hex");

    // Hash token and set to resetPasswordToken field
    user.resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    // Set expiration to 1 hour
    user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000);

    await user.save();

    // Create reset URL (depends on environment)
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`;

    try {
      await sendPasswordResetEmail(user.email, resetUrl);
      
      return NextResponse.json(
        { message: "If that email exists in our system, we've sent a password reset link to it." },
        { status: 200 }
      );
    } catch (err) {
      console.error("Email could not be sent:", err);
      
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save({ validateBeforeSave: false });
      
      return NextResponse.json(
        { message: "Email could not be sent. Please try again later." },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { message: "An error occurred during password reset request" },
      { status: 500 }
    );
  }
}
