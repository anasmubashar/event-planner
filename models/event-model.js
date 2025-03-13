import mongoose from "mongoose";

const reminderSchema = new mongoose.Schema({
  time: {
    type: Date,
    required: true,
  },
  sent: {
    type: Boolean,
    default: false,
  },
});

const eventSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  date: {
    type: Date,
    required: true,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  reminders: [reminderSchema],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Create indexes for common queries
eventSchema.index({ user: 1, date: 1 });
eventSchema.index({ user: 1, category: 1 });

const Event = mongoose.model("Event", eventSchema);

export default Event;
