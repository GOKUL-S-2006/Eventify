"use strict";

var Event = require('./../models/eventModel');

var _require = require("../services/icsService"),
    generateICS = _require.generateICS;

var _require2 = require("../services/emailService"),
    sendEmail = _require2.sendEmail; // Create Event


var createEvent = function createEvent(req, res) {
  var _req$body, title, description, start, duration, email, location, company, newEvent, icsFile;

  return regeneratorRuntime.async(function createEvent$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.prev = 0;
          _req$body = req.body, title = _req$body.title, description = _req$body.description, start = _req$body.start, duration = _req$body.duration, email = _req$body.email, location = _req$body.location, company = _req$body.company;

          if (!(!title || !start || !duration || !email)) {
            _context.next = 4;
            break;
          }

          return _context.abrupt("return", res.status(400).json({
            message: "Missing required fields"
          }));

        case 4:
          _context.next = 6;
          return regeneratorRuntime.awrap(Event.create({
            title: title,
            description: description,
            start: start,
            duration: duration,
            email: email,
            location: location || "Not specified",
            company: company || "Unknown"
          }));

        case 6:
          newEvent = _context.sent;
          _context.next = 9;
          return regeneratorRuntime.awrap(generateICS({
            title: title,
            description: description,
            start: start,
            duration: duration
          }));

        case 9:
          icsFile = _context.sent;
          _context.next = 12;
          return regeneratorRuntime.awrap(sendEmail(email, icsFile, title));

        case 12:
          res.status(201).json({
            message: "✅ Event created, saved, and emailed successfully",
            event: newEvent
          });
          _context.next = 19;
          break;

        case 15:
          _context.prev = 15;
          _context.t0 = _context["catch"](0);
          console.error("Error creating event:", _context.t0);
          res.status(500).json({
            message: "❌ Failed to create event"
          });

        case 19:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[0, 15]]);
}; // Get all Events


var getEvents = function getEvents(req, res) {
  var events;
  return regeneratorRuntime.async(function getEvents$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _context2.prev = 0;
          _context2.next = 3;
          return regeneratorRuntime.awrap(Event.find());

        case 3:
          events = _context2.sent;
          res.status(200).json(events);
          _context2.next = 11;
          break;

        case 7:
          _context2.prev = 7;
          _context2.t0 = _context2["catch"](0);
          console.error("Error fetching events:", _context2.t0);
          res.status(500).json({
            message: "❌ Failed to fetch events"
          });

        case 11:
        case "end":
          return _context2.stop();
      }
    }
  }, null, null, [[0, 7]]);
};

module.exports = {
  createEvent: createEvent,
  getEvents: getEvents
};