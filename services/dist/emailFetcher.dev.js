"use strict";

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var fs = require("fs");

var path = require("path");

var imaps = require("imap-simple");

var simpleParser = require("mailparser").simpleParser;

var _require = require("./icsService"),
    generateICS = _require.generateICS;

var _require2 = require("./emailService"),
    sendEmail = _require2.sendEmail;

var Event = require("../models/eventModel");

var _require3 = require("./parseService"),
    isPlacementEmail = _require3.isPlacementEmail,
    parsePlacementEmail = _require3.parsePlacementEmail; // IMAP config


var config = {
  imap: {
    user: process.env.EMAIL_USER,
    password: process.env.EMAIL_PASS,
    host: "imap.gmail.com",
    port: 993,
    tls: true,
    authTimeout: 10000,
    // increase timeout
    tlsOptions: {
      rejectUnauthorized: false
    }
  }
};

var fetchEmailsAndCreateEvents = function fetchEmailsAndCreateEvents() {
  var connection, searchCriteria, fetchOptions, messages, summaryText, attachments, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, item, all, rawBody, parsed, subject, text, eventData, icsFile, icsPath, txtPath;

  return regeneratorRuntime.async(function fetchEmailsAndCreateEvents$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.prev = 0;
          _context.next = 3;
          return regeneratorRuntime.awrap(imaps.connect({
            imap: config.imap
          }));

        case 3:
          connection = _context.sent;
          _context.next = 6;
          return regeneratorRuntime.awrap(connection.openBox("INBOX"));

        case 6:
          // Search unread emails
          searchCriteria = ["UNSEEN"];
          fetchOptions = {
            bodies: ["HEADER.FIELDS (FROM TO SUBJECT DATE)", "TEXT"],
            markSeen: true
          };
          _context.next = 10;
          return regeneratorRuntime.awrap(connection.search(searchCriteria, fetchOptions));

        case 10:
          messages = _context.sent;
          // 📝 Collect summary + attachments
          summaryText = "📌 Placement Digest:\n\n";
          attachments = [];
          _iteratorNormalCompletion = true;
          _didIteratorError = false;
          _iteratorError = undefined;
          _context.prev = 16;
          _iterator = messages[Symbol.iterator]();

        case 18:
          if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
            _context.next = 45;
            break;
          }

          item = _step.value;
          all = item.parts.find(function (part) {
            return part.which === "TEXT";
          });
          rawBody = all.body; // Parse email content

          _context.next = 24;
          return regeneratorRuntime.awrap(simpleParser(rawBody));

        case 24:
          parsed = _context.sent;
          subject = parsed.subject || "No Title";
          text = parsed.text || ""; // Skip non-placement emails

          if (isPlacementEmail(subject, text)) {
            _context.next = 29;
            break;
          }

          return _context.abrupt("continue", 42);

        case 29:
          // Extract structured placement event
          eventData = parsePlacementEmail(subject, text);

          if (eventData) {
            _context.next = 32;
            break;
          }

          return _context.abrupt("continue", 42);

        case 32:
          _context.next = 34;
          return regeneratorRuntime.awrap(Event.create(_objectSpread({}, eventData, {
            email: config.imap.user
          })));

        case 34:
          _context.next = 36;
          return regeneratorRuntime.awrap(generateICS({
            title: eventData.title,
            description: eventData.description,
            start: eventData.start,
            duration: eventData.duration
          }));

        case 36:
          icsFile = _context.sent;
          // Save .ics temp file
          icsPath = path.join(__dirname, "../tmp/".concat(eventData.title, ".ics"));
          fs.writeFileSync(icsPath, icsFile);
          attachments.push(icsPath); // Append to summary

          summaryText += "\uD83D\uDD39 ".concat(eventData.title, "\nCompany: ").concat(eventData.company, "\nLocation: ").concat(eventData.location, "\nDate: ").concat(eventData.start.join("-"), "\n\n");
          console.log("\u2705 Placement Event created: ".concat(eventData.title, " (").concat(eventData.company, ")"));

        case 42:
          _iteratorNormalCompletion = true;
          _context.next = 18;
          break;

        case 45:
          _context.next = 51;
          break;

        case 47:
          _context.prev = 47;
          _context.t0 = _context["catch"](16);
          _didIteratorError = true;
          _iteratorError = _context.t0;

        case 51:
          _context.prev = 51;
          _context.prev = 52;

          if (!_iteratorNormalCompletion && _iterator["return"] != null) {
            _iterator["return"]();
          }

        case 54:
          _context.prev = 54;

          if (!_didIteratorError) {
            _context.next = 57;
            break;
          }

          throw _iteratorError;

        case 57:
          return _context.finish(54);

        case 58:
          return _context.finish(51);

        case 59:
          if (!(attachments.length > 0)) {
            _context.next = 67;
            break;
          }

          // Save summary as TXT
          txtPath = path.join(__dirname, "../tmp/summary.txt");
          fs.writeFileSync(txtPath, summaryText);
          attachments.push(txtPath); // Send single digest mail

          _context.next = 65;
          return regeneratorRuntime.awrap(sendEmail(config.imap.user, attachments, "Placement Digest"));

        case 65:
          _context.next = 68;
          break;

        case 67:
          console.log("No new placement emails found.");

        case 68:
          connection.end();
          _context.next = 74;
          break;

        case 71:
          _context.prev = 71;
          _context.t1 = _context["catch"](0);
          console.error("❌ Error fetching emails:", _context.t1);

        case 74:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[0, 71], [16, 47, 51, 59], [52,, 54, 58]]);
};

module.exports = {
  fetchEmailsAndCreateEvents: fetchEmailsAndCreateEvents
};