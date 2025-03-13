import express from "express";
import Event from "../models/event-model.js";
import Category from "../models/category-model.js";
import { authenticate } from "../middleware/auth-middleware.js";

const router = express.Router();

// Apply authentication middleware to all event routes
router.use(authenticate);

// Get all events for the current user with optional filtering
router.get("/", async (req, res) => {
  try {
    const {
      category,
      startDate,
      endDate,
      sortBy = "date",
      sortOrder = "asc",
    } = req.query;

    // Build query
    const query = { user: req.user._id };

    // Add category filter if provided
    if (category) {
      query.category = category;
    }

    // Add date range filter if provided
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    // Build sort options
    const sort = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    // Execute query with population of category
    const events = await Event.find(query)
      .populate("category", "name color")
      .sort(sort);

    res.json({
      success: true,
      count: events.length,
      data: events,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching events",
      error: error.message,
    });
  }
});

// Create a new event
router.post("/", async (req, res) => {
  try {
    const { name, description, date, category, reminders } = req.body;

    // Validate category if provided
    if (category) {
      const categoryExists = await Category.findOne({
        _id: category,
        user: req.user._id,
      });

      if (!categoryExists) {
        return res.status(400).json({
          success: false,
          message: "Invalid category",
        });
      }
    }

    // Create event
    const event = new Event({
      name,
      description,
      date: new Date(date),
      category,
      user: req.user._id,
      reminders: reminders?.map((r) => ({ time: new Date(r) })) || [],
    });

    await event.save();

    // Populate category for response
    await event.populate("category", "name color");

    res.status(201).json({
      success: true,
      message: "Event created successfully",
      data: event,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating event",
      error: error.message,
    });
  }
});

// Get a single event
router.get("/:id", async (req, res) => {
  try {
    const event = await Event.findOne({
      _id: req.params.id,
      user: req.user._id,
    }).populate("category", "name color");

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    res.json({
      success: true,
      data: event,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching event",
      error: error.message,
    });
  }
});

// Update an event
router.put("/:id", async (req, res) => {
  try {
    const { name, description, date, category, reminders } = req.body;

    // Check if event exists
    let event = await Event.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    // Validate category if provided
    if (category) {
      const categoryExists = await Category.findOne({
        _id: category,
        user: req.user._id,
      });

      if (!categoryExists) {
        return res.status(400).json({
          success: false,
          message: "Invalid category",
        });
      }
    }

    // Prepare update data
    const updateData = {
      name,
      description,
      category,
    };

    // Only update date if provided
    if (date) {
      updateData.date = new Date(date);
    }

    // Only update reminders if provided
    if (reminders) {
      updateData.reminders = reminders.map((r) => ({
        time: new Date(r),
        sent: false, // Reset sent status for new reminders
      }));
    }

    // Update event
    event = await Event.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      updateData,
      {
        new: true,
        runValidators: true,
      }
    ).populate("category", "name color");

    res.json({
      success: true,
      message: "Event updated successfully",
      data: event,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating event",
      error: error.message,
    });
  }
});

// Delete an event
router.delete("/:id", async (req, res) => {
  try {
    const event = await Event.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    res.json({
      success: true,
      message: "Event deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting event",
      error: error.message,
    });
  }
});

// Add a reminder to an event
router.post("/:id/reminders", async (req, res) => {
  try {
    const { time } = req.body;

    if (!time) {
      return res.status(400).json({
        success: false,
        message: "Reminder time is required",
      });
    }

    // Check if event exists
    const event = await Event.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    // Add reminder
    event.reminders.push({ time: new Date(time) });
    await event.save();

    res.status(201).json({
      success: true,
      message: "Reminder added successfully",
      data: event,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error adding reminder",
      error: error.message,
    });
  }
});

// Delete a reminder from an event
router.delete("/:eventId/reminders/:reminderId", async (req, res) => {
  try {
    // Check if event exists
    const event = await Event.findOne({
      _id: req.params.eventId,
      user: req.user._id,
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    // Find and remove the reminder
    const reminderIndex = event.reminders.findIndex(
      (r) => r._id.toString() === req.params.reminderId
    );

    if (reminderIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Reminder not found",
      });
    }

    event.reminders.splice(reminderIndex, 1);
    await event.save();

    res.json({
      success: true,
      message: "Reminder deleted successfully",
      data: event,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting reminder",
      error: error.message,
    });
  }
});

// Get upcoming events with reminders
router.get("/reminders/upcoming", async (req, res) => {
  try {
    const now = new Date();

    // Find events with upcoming reminders
    const events = await Event.find({
      user: req.user._id,
      "reminders.time": { $gte: now },
      "reminders.sent": false,
    }).populate("category", "name color");

    res.json({
      success: true,
      count: events.length,
      data: events,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching upcoming reminders",
      error: error.message,
    });
  }
});

export default router;
