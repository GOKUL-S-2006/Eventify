Eventify / Placement Digest

Eventify is a Node.js-based automation tool designed for students to manage placement-related emails efficiently. It connects to your Gmail account, fetches placement emails, parses key details like company name, role, location, and date, and automatically generates:

Calendar (.ics) files – so you can add events directly to your calendar.

Summary text files (.txt) – providing a quick digest of all placement notifications.

Automated email notifications – sending the summary and calendar invites in a single mail.

Features

IMAP email integration: Fetch unread placement emails automatically.

Placement parsing: Detects placement-related keywords and extracts structured event details.

.ICS generation: Creates calendar events for easier scheduling.

Summary digest: Generates a concise text summary of all placement emails.

Automated notifications: Sends both the summary and calendar files via email.

Cron scheduling: Automatically checks for new emails at configurable intervals.

Tech Stack

Node.js

IMAP (imap-simple)

Mailparser (simpleParser)

Nodemailer

Chrono-node for date parsing

MongoDB for storing events

Use Case

Ideal for students who receive numerous placement notifications and want a single consolidated view of all events without manually checking each email.
