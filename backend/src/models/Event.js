// backend/src/models/Event.js
import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      maxlength: 200,
    },
    description: {
      type: String,
      maxlength: 2000,
    },
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sport: {
      type: String,
      required: true,
    },
    eventType: {
      type: String,
      enum: ["clinic", "tournament", "workshop", "bootcamp", "match", "training", "other"],
      default: "other",
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    time: String, // e.g., "4:00 PM - 6:00 PM"
    location: {
      name: String,
      address: String,
      city: String,
      state: String,
      country: String,
      coordinates: {
        type: [Number], // [longitude, latitude]
        index: "2dsphere",
      },
    },
    capacity: {
      max: {
        type: Number,
        required: true,
      },
      current: {
        type: Number,
        default: 0,
      },
    },
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    waitlist: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    pricing: {
      type: {
        type: String,
        enum: ["free", "paid"],
        default: "free",
      },
      amount: {
        type: Number,
        min: 0,
        default: 0,
      },
      currency: {
        type: String,
        default: "USD",
      },
      paymentInstructions: {
        type: String,
        maxlength: 1000,
      },
    },
    skillLevel: {
      type: String,
      enum: ["beginner", "intermediate", "advanced", "all"],
      default: "all",
    },
    ageGroup: {
      min: Number,
      max: Number,
    },
    requirements: [String],
    whatToBring: [String],
    images: [String],
    tags: [String],
    status: {
      type: String,
      enum: ["draft", "published", "cancelled", "completed"],
      default: "published",
    },
    featured: {
      type: Boolean,
      default: false,
    },
    visibility: {
      type: String,
      enum: ["public", "private", "invite-only"],
      default: "public",
    },
  },
  { timestamps: true }
);

// Indexes
eventSchema.index({ sport: 1, startDate: 1 });
eventSchema.index({ "location.city": 1 });
eventSchema.index({ startDate: 1 });
eventSchema.index({ featured: -1, startDate: 1 });
eventSchema.index({ status: 1, startDate: 1 });
eventSchema.index({ "location.coordinates": "2dsphere" });

export default mongoose.model("Event", eventSchema);
