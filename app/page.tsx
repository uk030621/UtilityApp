"use client";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [redirecting, setRedirecting] = useState(false); // Prevent multiple redirects

  useEffect(() => {
    if (status === "unauthenticated" && !redirecting) {
      setRedirecting(true);
      router.replace("/login");
    }
  }, [status, router, redirecting]);

  if (status === "loading") {
    return <p className="text-gray-500 text-sm">Loading...</p>; // Shows a brief message
  }

  if (status === "unauthenticated") {
    return null; // Prevent flicker before redirect
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-start py-4 bg-gradient-to-b from-yellow-100 to-yellow-300 px-4">
      <h1 className="text-3xl font-bold mb-6">MY UTILITY APP 🌏</h1>
      {/*<h1 className="text-xl font-extrabold">
        Welcome{session?.user?.name ? `, ${session.user.name}` : ""}!
      </h1>*/}
      <h1 className="text-xl font-extrabold text-black">
        Welcome
        {session?.user?.name ? `, ${session.user.name.split(" ")[0]}` : ""}!
      </h1>

      <p className="text-black mb-5 ">You are signed-in👍</p>
      <p className="text-black pb-2">Select an option from below...</p>
      <ul className="list-none text-center">
        <li className="mb-2">
          <Link
            href="/crud"
            className="text-blue-700  text-basic font-light hover:underline"
          >
            Simple Activity List
          </Link>
        </li>
        <li className="mb-2">
          <Link
            href="/taxparameters"
            className="text-blue-700  text-basic font-light hover:underline "
          >
            Basic Tax Calculator
          </Link>
        </li>
        <li className="mb-2">
          <Link
            href="/qrcodegen"
            className="text-blue-700  text-basic font-light hover:underline"
          >
            QR Code Generator
          </Link>
        </li>
      </ul>
      <p className="text-black text-1xl mt-2 font-extrabold">OR</p>
      <button
        className="rounded-md bg-red-600 px-3 mt-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500"
        onClick={() => signOut({ callbackUrl: "/login" })} // Immediate logout
      >
        Sign Out
      </button>
    </main>
  );
}
