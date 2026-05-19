import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongoose";
import Destination from "@/models/Destination";

export async function GET() {
  try {
    await connectToDatabase();
    const destinations = await Destination.find({}).sort({ createdAt: -1 }).lean();
    return NextResponse.json(destinations);
  } catch (error) {
    console.error("Error fetching destinations:", error);
    return NextResponse.json(
      { message: "Failed to fetch destinations" },
      { status: 500 }
    );
  }
}
