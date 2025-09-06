const express = require("express");
const app = express();
const dotenv = require("dotenv");
const cors = require("cors");
const db = require("./config/db");
const cron = require("node-cron");
dotenv.config(); // Load environment variables from .env

const eventRoutes = require("./routes/eventRoutes");
const { fetchEmailsAndCreateEvents } = require("./services/emailFetcher");



app.use(express.json());
app.use(cors());

// Mount routes
app.use("/api/events", eventRoutes);

const PORT = process.env.PORT || 8000;

const startServer = async () => {
  await db.connectDB();

  // Start the server
  app.listen(PORT, () => {
    console.log(`Server's Up on PORT ${PORT}!`);
  });

  // 🔄 Cron job: run every 5 minutes to fetch placement emails
  cron.schedule("*/1 * * * *", async () => {
    console.log("Checking for new placement emails...");
    await fetchEmailsAndCreateEvents();
  });
};

startServer();
