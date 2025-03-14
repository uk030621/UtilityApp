//app/crud/page.js
"use client";
import { useSession, signIn, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function Home() {
  const { data: session, status } = useSession();
  const [posts, setPosts] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    if (status === "authenticated") fetchPosts();
  }, [status]);

  const fetchPosts = async () => {
    const res = await fetch("/api/posts");
    const data = await res.json();
    setPosts(data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!session) return;

    const method = editing ? "PUT" : "POST";
    const body = JSON.stringify(
      editing ? { id: editing, title, content } : { title, content }
    );

    await fetch("/api/posts", { method, body });
    setTitle("");
    setContent("");
    setEditing(null);
    fetchPosts();
  };

  const handleDelete = async (id) => {
    await fetch("/api/posts", {
      method: "DELETE",
      body: JSON.stringify({ id }),
    });
    fetchPosts();
  };

  if (status === "loading") return <p className="p-6 text-xl">Loading...</p>;

  return (
    <div className="m-0 min-h-screen flex flex-col items-center p-6 w-full  bg-gradient-to-b from-slate-100 to-slate-500 px-4">
      <div className=" shadow-md rounded-lg p-6 w-full max-w-md">
        {session ? (
          <>
            <Link
              className="bg-slate-900 rounded-md text-sm text-white py-2 px-2 hover:bg-slate-700"
              href="/"
            >
              ◀ Menu
            </Link>
            {/*<button
              onClick={() => signOut()}
              className="mt-0 mb-3 bg-red-500 text-white px-4 py-2 rounded-md"
            >
              Sign Out
            </button>*/}
            <h1 className="text-basic mt-4 text-black">
              Reminders for:{" "}
              <span className="font-bold">{session.user.name}</span>
            </h1>
            <form onSubmit={handleSubmit} className="mt-3 space-y-3">
              <input
                type="text"
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-2 border rounded-md text-black"
                required
              />
              <textarea
                placeholder="Content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full p-2 border rounded-md text-black"
                required
              />
              <button
                type="submit"
                className="w-full bg-slate-900 text-sm text-white p-2 rounded-md hover:bg-slate-700"
              >
                {editing ? "Update" : "Create"} Reminder
              </button>
            </form>

            <h2 className="mt-6 text-basic font-semibold text-black">
              Your Reminders...
            </h2>
            {posts.map((post) => (
              <div
                key={post._id}
                className="border p-3 rounded-md mt-2 bg-gray-50 w-full break-words text-black"
              >
                <h3 className="font-bold mb-0">{post.title}</h3>
                <p className="whitespace-normal break-words mb-3 text-sm">
                  {post.content}
                </p>
                <button
                  onClick={() => {
                    setEditing(post._id);
                    setTitle(post.title);
                    setContent(post.content);
                  }}
                  className="text-blue-500 mr-4 text-xs"
                >
                  ✍️Edit
                </button>
                <button
                  onClick={() => handleDelete(post._id)}
                  className="text-red-500 text-xs"
                >
                  🗑️Delete
                </button>
              </div>
            ))}
          </>
        ) : (
          <>
            <h1 className="text-xl font-bold text-black">Sign Back In?</h1>
            <button
              onClick={() => signIn()}
              className="mt-3 bg-blue-500 text-white px-4 py-2 rounded-md"
            >
              Sign In
            </button>
          </>
        )}
      </div>
    </div>
  );
}
