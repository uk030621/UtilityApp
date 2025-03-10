//app/api/tax-parameters/route.js
import { connectDB } from "@/lib/mongodb";
import TaxParameter from "@/models/TaxParameter";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET: Fetch all tax parameters (for the logged-in user)
export async function GET(_req) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    if (!session) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      });
    }

    // Fetch only the authenticated user's tax parameters
    const parameters = await TaxParameter.find({ userId: session.user.id });
    return new Response(JSON.stringify(parameters), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}

// POST: Add a new tax parameter for the logged-in user
export async function POST(request) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    if (!session) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      });
    }

    const data = await request.json();

    if (!data.year) {
      return new Response(JSON.stringify({ error: "Tax year is required" }), {
        status: 400,
      });
    }

    // Attach the authenticated user's ID to the new tax parameter
    const newParameter = await TaxParameter.create({
      ...data,
      userId: session.user.id,
    });

    return new Response(JSON.stringify(newParameter), { status: 201 });
  } catch (error) {
    if (error.code === 11000) {
      return new Response(
        JSON.stringify({ error: "Tax year already exists" }),
        { status: 400 }
      );
    }
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}
