import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongoose";
import Package from "@/models/Package";

export async function GET(request: Request) {
  try {
    await connectToDatabase();
    
    const { searchParams } = new URL(request.url);
    const featured = searchParams.get('featured');
    
    const query = featured === 'true' ? { isFeatured: true } : {};
    
    const packages = await Package.find(query).sort({ createdAt: -1 });
    return NextResponse.json(packages);
  } catch (error) {
    console.error("Error fetching packages:", error);
    return NextResponse.json(
      { message: "Failed to fetch packages" },
      { status: 500 }
    );
  }
}
