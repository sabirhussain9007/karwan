import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongoose";
import Post from "@/models/Post";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { TRIP_TYPES } from "@/lib/community/constants";

function formatPost(
  post: {
    _id: unknown;
    title: string;
    content: string;
    destination?: string;
    imageUrl?: string;
    likedBy?: unknown[];
    comments?: unknown[];
    createdAt: Date;
    authorName?: string;
    authorId?: { name?: string } | null;
    tags?: string[];
    tripType?: string;
    rating?: number | null;
  },
  userId: string | null
) {
  const id = String(post._id);
  return {
    _id: id,
    title: post.title,
    content: post.content,
    destination: post.destination ?? "",
    imageUrl: post.imageUrl ?? "",
    tags: post.tags ?? [],
    tripType: post.tripType ?? "Other",
    rating: post.rating ?? null,
    likes: post.likedBy?.length ?? 0,
    hasLiked: userId ? post.likedBy?.some((u) => String(u) === userId) : false,
    comments: post.comments ?? [],
    commentCount: post.comments?.length ?? 0,
    createdAt: post.createdAt,
    author:
      post.authorName ||
      (typeof post.authorId === "object" && post.authorId?.name) ||
      "Guest Traveler",
  };
}

export async function GET(req: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);

    const q = searchParams.get("q")?.trim().toLowerCase();
    const destination = searchParams.get("destination")?.trim();
    const tag = searchParams.get("tag")?.trim();
    const tripType = searchParams.get("tripType")?.trim();
    const sort = searchParams.get("sort") || "recent";

    const filter: Record<string, unknown> = { isPublished: { $ne: false } };

    if (destination) {
      filter.destination = { $regex: destination, $options: "i" };
    }
    if (tag) {
      filter.tags = tag;
    }
    if (tripType && TRIP_TYPES.includes(tripType as (typeof TRIP_TYPES)[number])) {
      filter.tripType = tripType;
    }
    if (q) {
      filter.$or = [
        { title: { $regex: q, $options: "i" } },
        { content: { $regex: q, $options: "i" } },
        { destination: { $regex: q, $options: "i" } },
      ];
    }

    let posts = await Post.find(filter)
      .populate("authorId", "name")
      .lean();

    if (sort === "popular") {
      posts.sort(
        (a, b) => (b.likedBy?.length ?? 0) - (a.likedBy?.length ?? 0)
      );
    } else if (sort === "discussed") {
      posts.sort(
        (a, b) => (b.comments?.length ?? 0) - (a.comments?.length ?? 0)
      );
    } else {
      posts.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }

    const session = await getServerSession(authOptions);
    const userId = session?.user ? (session.user as { id?: string }).id ?? null : null;

    const formattedPosts = posts.map((post) =>
      formatPost(
        post as Parameters<typeof formatPost>[0],
        userId
      )
    );

    return NextResponse.json(formattedPosts);
  } catch (error) {
    console.error("Error fetching posts:", error);
    return NextResponse.json(
      { message: "Failed to fetch posts" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { title, content, destination, imageUrl, tags, tripType, rating } =
      body;

    if (!title?.trim() || !content?.trim()) {
      return NextResponse.json(
        { message: "Title and content are required" },
        { status: 400 }
      );
    }

    const normalizedTags = Array.isArray(tags)
      ? tags
          .map((t: string) => t.trim())
          .filter(Boolean)
          .slice(0, 5)
      : [];

    let normalizedRating: number | null = null;
    if (rating != null && rating !== "") {
      const n = Number(rating);
      if (n >= 1 && n <= 5) normalizedRating = Math.round(n);
    }

    const normalizedTripType =
      tripType && TRIP_TYPES.includes(tripType) ? tripType : "Other";

    await connectToDatabase();

    const newPost = new Post({
      title: title.trim(),
      content: content.trim(),
      destination: destination?.trim() || "",
      imageUrl: imageUrl || "",
      tags: normalizedTags,
      tripType: normalizedTripType,
      rating: normalizedRating,
      authorId: (session.user as { id: string }).id,
      authorName: session.user.name || "Traveler",
      likedBy: [],
      comments: [],
    });

    await newPost.save();

    return NextResponse.json(
      { message: "Post created successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating post:", error);
    return NextResponse.json(
      { message: "Failed to create post" },
      { status: 500 }
    );
  }
}
