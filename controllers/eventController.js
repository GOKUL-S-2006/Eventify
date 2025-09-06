const Event = require('./../models/eventModel');
const { generateICS } = require("../services/icsService");
const { sendEmail } = require("../services/emailService");

// Create Event
const createEvent = async (req, res) => {
  try {
    const { title, description, start, duration, email, location, company } = req.body;

    if (!title || !start || !duration || !email) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // 1️⃣ Save to DB
    const newEvent = await Event.create({
      title,
      description,
      start,
      duration,
      email,
      location: location || "Not specified",
      company: company || "Unknown"
    });

    // 2️⃣ Generate .ics file
    const icsFile = await generateICS({
      title,
      description,
      start,
      duration,
    });

    // 3️⃣ Send email
    await sendEmail(email, icsFile, title);

    res.status(201).json({
      message: "✅ Event created, saved, and emailed successfully",
      event: newEvent,
    });

  } catch (error) {
    console.error("Error creating event:", error);
    res.status(500).json({ message: "❌ Failed to create event" });
  }
};

// Get all Events
const getEvents = async (req, res) => {
  try {
    const events = await Event.find();
    res.status(200).json(events);
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({ message: "❌ Failed to fetch events" });
  }
};

module.exports = { createEvent, getEvents };
