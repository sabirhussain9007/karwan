import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongoose";
import Post from "@/models/Post";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { text } = await req.json();

    if (!text || text.trim() === "") {
      return NextResponse.json({ message: "Comment text is required" }, { status: 400 });
    }
    const userId = (session.user as any).id;
    const userName = session.user.name || "Guest Traveler";
    const postId = id;

    if (!postId) {
      return NextResponse.json({ message: "Post ID is required" }, { status: 400 });
    }

    await connectToDatabase();

    const post = await Post.findById(postId);

    if (!post) {
      return NextResponse.json({ message: "Post not found" }, { status: 404 });
    }

    const newComment = {
      text: text.trim(),
      authorId: userId,
      authorName: userName,
      createdAt: new Date()
    };

    // Use findByIdAndUpdate to bypass strict document validation for legacy posts
    // For legacy posts where comments was a number, $push will fail if we don't ensure it's an array first.
    // However, if it's a number in DB, MongoDB $push will fail. We might need to force reset if it's a number.
    let updatedPost;
    try {
      updatedPost = await Post.findByIdAndUpdate(
        postId,
        { $push: { comments: newComment } },
        { new: true }
      );
    } catch (e: any) {
      // If it fails (likely due to comments being a number in DB), we reset it
      updatedPost = await Post.findByIdAndUpdate(
        postId,
        { $set: { comments: [newComment] } },
        { new: true }
      );
    }

    return NextResponse.json({
      message: "Comment added successfully",
      comment: newComment,
      commentCount: updatedPost?.comments?.length || 1
    }, { status: 201 });

  } catch (error) {
    console.error("Error adding comment:", error);
    return NextResponse.json(
      { message: "Failed to add comment" },
      { status: 500 }
    );
  }
}
