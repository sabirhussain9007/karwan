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

    const userId = (session.user as any).id;
    const postId = id;

    if (!postId) {
      return NextResponse.json({ message: "Post ID is required" }, { status: 400 });
    }

    await connectToDatabase();

    const post = await Post.findById(postId);

    if (!post) {
      return NextResponse.json({ message: "Post not found" }, { status: 404 });
    }

    const hasLiked = post.likedBy?.includes(userId) || false;

    let updatedPost;
    try {
      if (hasLiked) {
        updatedPost = await Post.findByIdAndUpdate(
          postId,
          { $pull: { likedBy: userId } },
          { new: true }
        );
      } else {
        updatedPost = await Post.findByIdAndUpdate(
          postId,
          { $addToSet: { likedBy: userId } },
          { new: true }
        );
      }
    } catch (e) {
      // Fallback if legacy fields cause MongoDB update errors
      updatedPost = await Post.findByIdAndUpdate(
        postId,
        { 
          $set: { likedBy: hasLiked ? [] : [userId], comments: [] },
          $unset: { likes: 1 } 
        },
        { new: true }
      );
    }

    return NextResponse.json({
      message: hasLiked ? "Post unliked" : "Post liked",
      likes: updatedPost?.likedBy?.length || 0,
      hasLiked: !hasLiked
    }, { status: 200 });

  } catch (error) {
    console.error("Error toggling like:", error);
    return NextResponse.json(
      { message: "Failed to toggle like" },
      { status: 500 }
    );
  }
}
