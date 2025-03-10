"use server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";

// Function to capitalize the first letter of each word
const formatName = (name: string) => {
  return name
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export const register = async (values: any) => {
  const { email, password, name } = values;

  try {
    await connectDB();

    const normalizedEmail = email.toLowerCase();
    const formattedName = formatName(name); // Ensure name is properly formatted

    const userFound = await User.findOne({ email: normalizedEmail });
    if (userFound) {
      return {
        error: "Email already exists!",
      };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name: formattedName, // Save formatted name
      email: normalizedEmail,
      password: hashedPassword,
    });

    await user.save();

    return { success: true };
  } catch (e) {
    console.error("Registration Error:", e);
    return { error: "Something went wrong. Please try again!" };
  }
};
