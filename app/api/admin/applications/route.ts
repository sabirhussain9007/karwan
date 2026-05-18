import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import connectToDatabase from "@/lib/mongoose";
import Application from "@/models/Application";
import Booking from "@/models/Booking";
import Notification from "@/models/Notification";
import "@/models/User";
import "@/models/Package";
import { notifyStatusChange } from "@/lib/notifications";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const serviceType = searchParams.get("serviceType");
    const status = searchParams.get("status");

    let query: any = {};
    if (serviceType) query.serviceType = serviceType;
    if (status) query.status = status;

    const applications = await Application.find(query)
      .populate("userId", "name email")
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

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const body = await request.json();
    const { id, action, ...updateData } = body;

    const application = await Application.findById(id).populate("userId", "name email");
    if (!application) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    if (action === "approve") {
      application.status = "Approved";
      application.approvalDate = new Date();
      application.approvedBy = (session.user as any).id;
      
      // Create a booking when application is approved
      if (!application.packageId) {
        const booking = new Booking({
          userId: application.userId,
          serviceType: application.serviceType,
          status: "Confirmed",
          paymentStatus: application.paymentStatus,
          totalAmount: application.totalAmount,
          bookingDate: new Date(),
          travelDate: application.applicationData?.travelDate,
          returnDate: application.applicationData?.returnDate,
          passengers: application.applicationData?.numberOfPassengers || 1,
          specialRequests: application.applicationData?.specialRequests || "",
          paymentId: application.paymentId,
        });
        await booking.save();
      }

      await Notification.create({
        userId: application.userId,
        title: "Application Approved",
        message: `Your application for ${application.serviceType} has been approved!
        kindly contact the administrator for further details.`,
        type: "success",
        relatedApplicationId: application._id
      });
      
      // Trigger Email Notification
      notifyStatusChange({
        user: application.userId,
        application,
      });
    } else if (action === "reject") {
      application.status = "Rejected";
      application.rejectionReason = updateData.reason || "Rejected by admin";

      await Notification.create({
        userId: application.userId,
        title: "Application Rejected",
        message: `Your application for ${application.serviceType} has been rejected. Reason: ${application.rejectionReason}`,
        type: "error",
        relatedApplicationId: application._id
      });
      
      // Trigger Email Notification
      notifyStatusChange({
        user: application.userId,
        application,
      });
    } else {
      Object.assign(application, updateData);
    }

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
    if (!session || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    const application = await Application.findByIdAndDelete(id);
    if (!application) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    await Notification.create({
      userId: application.userId,
      title: "Application Deleted",
      message: `Your application for ${application.serviceType} has been deleted by an administrator.`,
      type: "warning"
    });

    return NextResponse.json({ message: "Application deleted" });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete application" },
      { status: 500 }
    );
  }
}
