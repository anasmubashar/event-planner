// import nodemailer from "nodemailer";

// // Configure email transporter
// // In production, you would use a real email service
// const transporter = nodemailer.createTransport({
//   host: process.env.EMAIL_HOST || "smtp.example.com",
//   port: process.env.EMAIL_PORT || 587,
//   secure: process.env.EMAIL_SECURE === "true",
//   auth: {
//     user: process.env.EMAIL_USER || "user@example.com",
//     pass: process.env.EMAIL_PASSWORD || "password",
//   },
// });

// // Send notification to user
// export const sendNotification = async (user, event, reminder) => {
//   try {
//     // Calculate time until event
//     const timeUntilEvent = event.date - reminder.time;
//     const minutesUntilEvent = Math.floor(timeUntilEvent / (1000 * 60));

//     // Prepare email content
//     const emailContent = {
//       from:
//         process.env.EMAIL_FROM || '"Event Reminder" <reminders@example.com>',
//       to: user.email,
//       subject: `Reminder: ${event.name}`,
//       text: `
//         Hello ${user.username},

//         This is a reminder for your upcoming event: ${event.name}

//         Date: ${event.date.toLocaleString()}
//         ${event.category ? `Category: ${event.category.name}` : ""}
//         ${event.description ? `Description: ${event.description}` : ""}

//         This event will start in approximately ${minutesUntilEvent} minutes.

//         Thank you for using our Event Planning System!
//       `,
//       html: `
//         <h2>Hello ${user.username},</h2>

//         <p>This is a reminder for your upcoming event: <strong>${
//           event.name
//         }</strong></p>

//         <ul>
//           <li><strong>Date:</strong> ${event.date.toLocaleString()}</li>
//           ${
//             event.category
//               ? `<li><strong>Category:</strong> ${event.category.name}</li>`
//               : ""
//           }
//           ${
//             event.description
//               ? `<li><strong>Description:</strong> ${event.description}</li>`
//               : ""
//           }
//         </ul>

//         <p>This event will start in approximately <strong>${minutesUntilEvent} minutes</strong>.</p>

//         <p>Thank you for using our Event Planning System!</p>
//       `,
//     };

//     // Send email
//     await transporter.sendMail(emailContent);

//     console.log(`Reminder sent to ${user.email} for event: ${event.name}`);
//     return true;
//   } catch (error) {
//     console.error("Error sending notification:", error);
//     return false;
//   }
// };
