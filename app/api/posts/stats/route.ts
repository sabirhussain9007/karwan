import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongoose";
import Post from "@/models/Post";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await connectToDatabase();

    const posts = await Post.find({ isPublished: { $ne: false } }).select(
      "destination likedBy comments tags tripType"
    );

    const totalPosts = posts.length;
    let totalLikes = 0;
    let totalComments = 0;
    const destinationCounts: Record<string, number> = {};
    const tagCounts: Record<string, number> = {};

    for (const post of posts) {
      totalLikes += post.likedBy?.length ?? 0;
      totalComments += post.comments?.length ?? 0;

      const dest = post.destination?.trim();
      if (dest) {
        destinationCounts[dest] = (destinationCounts[dest] ?? 0) + 1;
      }

      for (const tag of post.tags ?? []) {
        const key = tag.trim();
        if (key) tagCounts[key] = (tagCounts[key] ?? 0) + 1;
      }
    }

    const topDestinations = Object.entries(destinationCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name, count]) => ({ name, count }));

    const trendingTags = Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name, count]) => ({ name, count }));

    return NextResponse.json({
      totalPosts,
      totalLikes,
      totalComments,
      topDestinations,
      trendingTags,
    });
  } catch (error) {
    console.error("Error fetching community stats:", error);
    return NextResponse.json(
      { message: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
