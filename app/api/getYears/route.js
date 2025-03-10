import { connectDB } from "@/lib/mongodb";
import TaxParameter from "@/models/TaxParameter";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET(_req) {
  await connectDB();
  const session = await getServerSession(authOptions);
  if (!session) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });
  }

  try {
    const years = await TaxParameter.find({ userId: session.user.id })
      .select("year -_id")
      .sort({ year: 1 });
    return NextResponse.json(years.map((y) => y.year));
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch years" },
      { status: 500 }
    );
  }
}
