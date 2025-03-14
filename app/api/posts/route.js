//app/api/posts/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/mongodb";
import Post from "@/models/Post";

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session)
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { title, content } = await req.json();
  await connectDB();

  const post = new Post({ title, content, userEmail: session.user.email });
  await post.save();

  return NextResponse.json(post, { status: 201 });
}

export async function GET(_req) {
  const session = await getServerSession(authOptions);
  if (!session)
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  await connectDB();
  const posts = await Post.find({ userEmail: session.user.email });

  return NextResponse.json(posts, { status: 200 });
}

export async function PUT(req) {
  const session = await getServerSession(authOptions);
  if (!session)
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { id, title, content } = await req.json();
  await connectDB();

  const updatedPost = await Post.findOneAndUpdate(
    { _id: id, userEmail: session.user.email },
    { title, content },
    { new: true }
  );

  return NextResponse.json(updatedPost, { status: 200 });
}

export async function DELETE(req) {
  const session = await getServerSession(authOptions);
  if (!session)
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { id } = await req.json();
  await connectDB();

  await Post.findOneAndDelete({ _id: id, userEmail: session.user.email });

  return NextResponse.json({ message: "Post deleted" }, { status: 200 });
}
