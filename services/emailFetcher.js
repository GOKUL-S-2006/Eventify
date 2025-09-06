const fs = require("fs");
const path = require("path");
const imaps = require("imap-simple");
const simpleParser = require("mailparser").simpleParser;

const { generateICS } = require("./icsService");
const { sendEmail } = require("./emailService");
const Event = require("../models/eventModel");
const { isPlacementEmail, parsePlacementEmail } = require("./parseService");

// IMAP config
const config = {
  imap: {
    user: process.env.EMAIL_USER,
    password: process.env.EMAIL_PASS,
    host: "imap.gmail.com",
    port: 993,
    tls: true,
    authTimeout: 10000, // increase timeout
    tlsOptions: { rejectUnauthorized: false },
  },
};

const fetchEmailsAndCreateEvents = async () => {
  try {
    const connection = await imaps.connect({ imap: config.imap });
    await connection.openBox("INBOX");

    // Search unread emails
    const searchCriteria = ["UNSEEN"];
    const fetchOptions = {
      bodies: ["HEADER.FIELDS (FROM TO SUBJECT DATE)", "TEXT"],
      markSeen: true,
    };

    const messages = await connection.search(searchCriteria, fetchOptions);

    // 📝 Collect summary + attachments
    let summaryText = "📌 Placement Digest:\n\n";
    let attachments = [];

    for (const item of messages) {
      const all = item.parts.find((part) => part.which === "TEXT");
      const rawBody = all.body;

      // Parse email content
      const parsed = await simpleParser(rawBody);
      const subject = parsed.subject || "No Title";
      const text = parsed.text || "";

      // Skip non-placement emails
      if (!isPlacementEmail(subject, text)) continue;

      // Extract structured placement event
      const eventData = parsePlacementEmail(subject, text);
      if (!eventData) continue; // skip if no date found

      // Save to DB
      await Event.create({ ...eventData, email: config.imap.user });

      // Generate .ics file
      const icsFile = await generateICS({
        title: eventData.title,
        description: eventData.description,
        start: eventData.start,
        duration: eventData.duration,
      });

      // Save .ics temp file
      const icsPath = path.join(__dirname, `../tmp/${eventData.title}.ics`);
      fs.writeFileSync(icsPath, icsFile);
      attachments.push(icsPath);

      // Append to summary
      summaryText += `🔹 ${eventData.title}\nCompany: ${eventData.company}\nLocation: ${eventData.location}\nDate: ${eventData.start.join(
        "-"
      )}\n\n`;

      console.log(
        `✅ Placement Event created: ${eventData.title} (${eventData.company})`
      );
    }

    if (attachments.length > 0) {
      // Save summary as TXT
      const txtPath = path.join(__dirname, "../tmp/summary.txt");
      fs.writeFileSync(txtPath, summaryText);
      attachments.push(txtPath);

      // Send single digest mail
      await sendEmail(config.imap.user, attachments, "Placement Digest");
    } else {
      console.log("No new placement emails found.");
    }

    connection.end();
  } catch (error) {
    console.error("❌ Error fetching emails:", error);
  }
};

module.exports = { fetchEmailsAndCreateEvents };
