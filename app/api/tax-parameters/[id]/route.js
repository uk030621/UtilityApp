import { connectDB } from "@/lib/mongodb";
import TaxParameter from "@/models/TaxParameter";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// PUT: Update a tax parameter by ID
export async function PUT(request, { params }) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    if (!session) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      });
    }

    const { id } = params; // Extract the ID from the URL
    if (!id) {
      return new Response(
        JSON.stringify({ error: "ID is required for update." }),
        { status: 400 }
      );
    }

    const data = await request.json();
    const { year, ...updateFields } = data;

    // Ensure the tax parameter belongs to the user
    const taxParam = await TaxParameter.findOne({
      _id: id,
      userId: session.user.id,
    });
    if (!taxParam) {
      return new Response(
        JSON.stringify({ error: "Not found or unauthorized." }),
        { status: 403 }
      );
    }

    // Perform the update
    const updatedParameter = await TaxParameter.findByIdAndUpdate(
      id,
      { $set: { ...updateFields, ...(year && { year }) } },
      { new: true, runValidators: true }
    );

    return new Response(JSON.stringify(updatedParameter), { status: 200 });
  } catch (error) {
    console.error("PUT Error:", error);
    return new Response(JSON.stringify({ error: "Failed to update record." }), {
      status: 500,
    });
  }
}

// DELETE: Remove a tax parameter by ID
export async function DELETE(_request, { params }) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    if (!session) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      });
    }

    const { id } = params; // Extract the ID from the URL
    if (!id) {
      return new Response(
        JSON.stringify({ error: "ID is required for deletion." }),
        { status: 400 }
      );
    }

    // Ensure the tax parameter belongs to the user
    const taxParam = await TaxParameter.findOne({
      _id: id,
      userId: session.user.id,
    });
    if (!taxParam) {
      return new Response(
        JSON.stringify({ error: "Not found or unauthorized." }),
        { status: 403 }
      );
    }

    await TaxParameter.findByIdAndDelete(id);

    return new Response(JSON.stringify({ message: "Record deleted" }), {
      status: 200,
    });
  } catch (error) {
    console.error("DELETE Error:", error);
    return new Response(JSON.stringify({ error: "Failed to delete record." }), {
      status: 500,
    });
  }
}
