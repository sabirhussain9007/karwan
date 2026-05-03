import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import connectToDatabase from "@/lib/mongoose";
import Application from "@/models/Application";
import Notification from "@/models/Notification";
import User from "@/models/User";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const applications = await Application.find({ userId: (session.user as any).id })
      .populate("packageId", "title price")
      .sort({ createdAt: -1 });

    return NextResponse.json(applications);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch applications" },
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
    const { serviceType, packageId, applicationData, totalAmount } = body;

    const application = new Application({
      userId: (session.user as any).id,
      serviceType,
      packageId: packageId || null,
      applicationData,
      totalAmount,
      status: "Pending",
      paymentStatus: "Unpaid",
    });

    await application.save();

    // Notify all admins about the new application
    const admins = await User.find({ role: 'admin' });
    if (admins.length > 0) {
      const notifications = admins.map(admin => ({
        userId: admin._id,
        title: "New Application Received",
        message: `A new application for ${serviceType} has been submitted by ${(session.user as any).name || (session.user as any).email}.`,
        type: "info",
        relatedApplicationId: application._id
      }));
      await Notification.insertMany(notifications);
    }

    return NextResponse.json(application, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to create application" },
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

    const application = await Application.findById(id);
    if (!application || application.userId.toString() !== (session.user as any).id) {
      return NextResponse.json(
        { error: "Application not found or unauthorized" },
        { status: 404 }
      );
    }

    Object.assign(application, updateData);
    await application.save();

    return NextResponse.json(application);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update application" },
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

    const application = await Application.findById(id);
    if (!application || application.userId.toString() !== (session.user as any).id) {
      return NextResponse.json(
        { error: "Application not found or unauthorized" },
        { status: 404 }
      );
    }

    // Only allow deletion if still pending
    if (application.status !== "Pending") {
      return NextResponse.json(
        { error: "Can only delete pending applications" },
        { status: 400 }
      );
    }

    await Application.findByIdAndDelete(id);

    return NextResponse.json({ message: "Application deleted" });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete application" },
      { status: 500 }
    );
  }
}
