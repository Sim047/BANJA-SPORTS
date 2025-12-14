// backend/src/models/Post.js
import mongoose from "mongoose";

const CommentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String, required: true },
    reactions: [{
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      emoji: { type: String },
      createdAt: { type: Date, default: Date.now }
    }],
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const PostSchema = new mongoose.Schema(
  {
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    caption: { type: String, default: "" },
    imageUrl: { type: String, default: "" },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    comments: [CommentSchema],
    tags: [{ type: String }],
    location: { type: String, default: "" },
  },
  { timestamps: true }
);

// Index for efficient queries
PostSchema.index({ author: 1, createdAt: -1 });
PostSchema.index({ createdAt: -1 });

export default mongoose.model("Post", PostSchema);
