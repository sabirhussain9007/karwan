import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongoose";
import Post from "@/models/Post";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export async function GET() {
  try {
    await connectToDatabase();
    const posts = await Post.find({})
      .populate("authorId", "name")
      .sort({ createdAt: -1 });
      
    const session = await getServerSession(authOptions);
    const userId = session?.user ? (session.user as any).id : null;

    const formattedPosts = posts.map(post => ({
      _id: post._id,
      title: post.title,
      content: post.content,
      destination: post.destination,
      imageUrl: post.imageUrl,
      likes: post.likedBy?.length || 0,
      hasLiked: userId ? post.likedBy?.includes(userId) : false,
      comments: post.comments || [],
      commentCount: post.comments?.length || 0,
      createdAt: post.createdAt,
      author: post.authorName || (post.authorId as any)?.name || 'Guest Traveler'
    }));
      
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

    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { title, content, destination, imageUrl } = await req.json();

    if (!title || !content) {
      return NextResponse.json(
        { message: "Title and content are required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const newPost = new Post({
      title,
      content,
      destination: destination || '',
      imageUrl: imageUrl || '',
      authorId: (session.user as any).id,
      authorName: session.user.name || 'Guest Traveler',
      likedBy: [],
      comments: []
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
