import mongoose from "mongoose";

const PostSchema = new mongoose.Schema({
  title: String,
  content: String,
  userEmail: String, // Store user identity
});

export default mongoose.models.Post || mongoose.model("Post", PostSchema);
