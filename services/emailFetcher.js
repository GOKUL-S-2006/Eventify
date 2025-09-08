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
    authTimeout: 10000,
    tlsOptions: { rejectUnauthorized: false },
  },
};

const fetchEmailsAndCreateEvents = async () => {
  try {
    const connection = await imaps.connect({ imap: config.imap });
    await connection.openBox("INBOX");

    const searchCriteria = ["ALL"]; // only new unread mails
    const fetchOptions = {
      bodies: [""], // fetch full raw mail
      markSeen: true,
    };

    const messages = await connection.search(searchCriteria, fetchOptions);

    let summaryText = "📌 Placement Digest:\n\n";
    let attachments = [];

    const tmpDir = path.join(__dirname, "../tmp");
    if (!fs.existsSync(tmpDir)) {
      fs.mkdirSync(tmpDir, { recursive: true });
    }

    for (const item of messages) {
      try {
        const all = item.parts.find((part) => part.which === "");
        if (!all || !all.body) continue;

        const parsed = await simpleParser(all.body);
        const subject =
          parsed.headers.get("subject") || parsed.subject || "Placement Drive";
        const text = parsed.text || parsed.html || "";

        if (!isPlacementEmail(subject, text)) continue;

        const eventData = parsePlacementEmail(subject, text);
        if (!eventData) continue;

        // ✅ Avoid duplicates (same title + date)
        const exists = await Event.findOne({
          title: eventData.title,
          "start.0": eventData.start[0], // year
          "start.1": eventData.start[1], // month
          "start.2": eventData.start[2], // day
        });
        if (exists) {
          console.log(`⚠️ Skipped duplicate: ${eventData.title}`);
          continue;
        }

        await Event.create({ ...eventData, email: config.imap.user });

        // ICS with richer description
        const icsDescription = `
Company: ${eventData.company}
Location: ${eventData.location}
Role: ${eventData.role || "N/A"}
Batch: ${eventData.batch || "N/A"}
Deadline: ${eventData.deadline || "N/A"}

${eventData.description}
        `.trim();

        const icsFile = await generateICS({
          title: eventData.title,
          description: icsDescription,
          start: eventData.start,
          duration: eventData.duration,
        });

        const safeTitle = eventData.title.replace(/[^\w\s-]/g, "_");
        const icsPath = path.join(tmpDir, `${safeTitle}.ics`);
        fs.writeFileSync(icsPath, icsFile);
        attachments.push(icsPath);

        // Summary text
        summaryText += `🔹 ${eventData.title}
Company: ${eventData.company}
Location: ${eventData.location}
Date: ${eventData.start.join("-")}
Role: ${eventData.role || "N/A"}
Batch: ${eventData.batch || "N/A"}
Deadline: ${eventData.deadline || "N/A"}
Apply: ${eventData.applyLink || "N/A"}

`;

        console.log(`✅ Placement Event created: ${eventData.title}`);
      } catch (err) {
        console.error("⚠️ Failed to parse one email:", err.message);
      }
    }

    if (attachments.length > 0) {
      const txtPath = path.join(tmpDir, "summary.txt");
      fs.writeFileSync(txtPath, summaryText);
      attachments.push(txtPath);

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
