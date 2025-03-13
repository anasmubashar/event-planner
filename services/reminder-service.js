import cron from "node-cron";
import Event from "../models/event-model.js";
import { sendNotification } from "./notification-service.js";

// Initialize the reminder system
export const initializeReminderSystem = () => {
  console.log("Initializing reminder system...");

  // Check for reminders every minute
  cron.schedule("* * * * *", async () => {
    try {
      await checkReminders();
    } catch (error) {
      console.error("Error checking reminders:", error);
    }
  });
};

// Check for reminders that need to be sent
const checkReminders = async () => {
  const now = new Date();
  const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000);

  // Find events with reminders that need to be sent
  const events = await Event.find({
    "reminders.time": { $lte: fiveMinutesFromNow, $gte: now },
    "reminders.sent": false,
  })
    .populate("user", "email username")
    .populate("category", "name");

  // Process each event
  for (const event of events) {
    for (const reminder of event.reminders) {
      // Check if this reminder needs to be sent
      if (!reminder.sent && reminder.time <= fiveMinutesFromNow) {
        // Send notification
        await sendNotification(event.user, event, reminder);

        // Mark reminder as sent
        reminder.sent = true;
      }
    }

    // Save the updated event
    await event.save();
  }
};
