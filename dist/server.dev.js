"use strict";

var express = require("express");

var app = express();

var dotenv = require("dotenv");

var cors = require("cors");

var db = require("./config/db");

var cron = require("node-cron");

dotenv.config(); // Load environment variables from .env

var eventRoutes = require("./routes/eventRoutes");

var _require = require("./services/emailFetcher"),
    fetchEmailsAndCreateEvents = _require.fetchEmailsAndCreateEvents;

app.use(express.json());
app.use(cors()); // Mount routes

app.use("/api/events", eventRoutes);
var PORT = process.env.PORT || 8000;

var startServer = function startServer() {
  return regeneratorRuntime.async(function startServer$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _context2.next = 2;
          return regeneratorRuntime.awrap(db.connectDB());

        case 2:
          // Start the server
          app.listen(PORT, function () {
            console.log("Server's Up on PORT ".concat(PORT, "!"));
          }); // 🔄 Cron job: run every 5 minutes to fetch placement emails

          cron.schedule("*/1 * * * *", function _callee() {
            return regeneratorRuntime.async(function _callee$(_context) {
              while (1) {
                switch (_context.prev = _context.next) {
                  case 0:
                    console.log("Checking for new placement emails...");
                    _context.next = 3;
                    return regeneratorRuntime.awrap(fetchEmailsAndCreateEvents());

                  case 3:
                  case "end":
                    return _context.stop();
                }
              }
            });
          });

        case 4:
        case "end":
          return _context2.stop();
      }
    }
  });
};

startServer();