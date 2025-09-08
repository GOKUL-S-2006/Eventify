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
    tlsOptions: {
      rejectUnauthorized: false
    }
  }
};

var fetchEmailsAndCreateEvents = function fetchEmailsAndCreateEvents() {
  var connection, searchCriteria, fetchOptions, messages, summaryText, attachments, tmpDir, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, item, all, parsed, subject, text, eventData, exists, icsDescription, icsFile, safeTitle, icsPath, txtPath;

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
          searchCriteria = ["ALL"]; // only new unread mails

          fetchOptions = {
            bodies: [""],
            // fetch full raw mail
            markSeen: true
          };
          _context.next = 10;
          return regeneratorRuntime.awrap(connection.search(searchCriteria, fetchOptions));

        case 10:
          messages = _context.sent;
          summaryText = "📌 Placement Digest:\n\n";
          attachments = [];
          tmpDir = path.join(__dirname, "../tmp");

          if (!fs.existsSync(tmpDir)) {
            fs.mkdirSync(tmpDir, {
              recursive: true
            });
          }

          _iteratorNormalCompletion = true;
          _didIteratorError = false;
          _iteratorError = undefined;
          _context.prev = 18;
          _iterator = messages[Symbol.iterator]();

        case 20:
          if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
            _context.next = 62;
            break;
          }

          item = _step.value;
          _context.prev = 22;
          all = item.parts.find(function (part) {
            return part.which === "";
          });

          if (!(!all || !all.body)) {
            _context.next = 26;
            break;
          }

          return _context.abrupt("continue", 59);

        case 26:
          _context.next = 28;
          return regeneratorRuntime.awrap(simpleParser(all.body));

        case 28:
          parsed = _context.sent;
          subject = parsed.headers.get("subject") || parsed.subject || "Placement Drive";
          text = parsed.text || parsed.html || "";

          if (isPlacementEmail(subject, text)) {
            _context.next = 33;
            break;
          }

          return _context.abrupt("continue", 59);

        case 33:
          eventData = parsePlacementEmail(subject, text);

          if (eventData) {
            _context.next = 36;
            break;
          }

          return _context.abrupt("continue", 59);

        case 36:
          _context.next = 38;
          return regeneratorRuntime.awrap(Event.findOne({
            title: eventData.title,
            "start.0": eventData.start[0],
            // year
            "start.1": eventData.start[1],
            // month
            "start.2": eventData.start[2] // day

          }));

        case 38:
          exists = _context.sent;

          if (!exists) {
            _context.next = 42;
            break;
          }

          console.log("\u26A0\uFE0F Skipped duplicate: ".concat(eventData.title));
          return _context.abrupt("continue", 59);

        case 42:
          _context.next = 44;
          return regeneratorRuntime.awrap(Event.create(_objectSpread({}, eventData, {
            email: config.imap.user
          })));

        case 44:
          // ICS with richer description
          icsDescription = "\nCompany: ".concat(eventData.company, "\nLocation: ").concat(eventData.location, "\nRole: ").concat(eventData.role || "N/A", "\nBatch: ").concat(eventData.batch || "N/A", "\nDeadline: ").concat(eventData.deadline || "N/A", "\n\n").concat(eventData.description, "\n        ").trim();
          _context.next = 47;
          return regeneratorRuntime.awrap(generateICS({
            title: eventData.title,
            description: icsDescription,
            start: eventData.start,
            duration: eventData.duration
          }));

        case 47:
          icsFile = _context.sent;
          safeTitle = eventData.title.replace(/[^\w\s-]/g, "_");
          icsPath = path.join(tmpDir, "".concat(safeTitle, ".ics"));
          fs.writeFileSync(icsPath, icsFile);
          attachments.push(icsPath); // Summary text

          summaryText += "\uD83D\uDD39 ".concat(eventData.title, "\nCompany: ").concat(eventData.company, "\nLocation: ").concat(eventData.location, "\nDate: ").concat(eventData.start.join("-"), "\nRole: ").concat(eventData.role || "N/A", "\nBatch: ").concat(eventData.batch || "N/A", "\nDeadline: ").concat(eventData.deadline || "N/A", "\nApply: ").concat(eventData.applyLink || "N/A", "\n\n");
          console.log("\u2705 Placement Event created: ".concat(eventData.title));
          _context.next = 59;
          break;

        case 56:
          _context.prev = 56;
          _context.t0 = _context["catch"](22);
          console.error("⚠️ Failed to parse one email:", _context.t0.message);

        case 59:
          _iteratorNormalCompletion = true;
          _context.next = 20;
          break;

        case 62:
          _context.next = 68;
          break;

        case 64:
          _context.prev = 64;
          _context.t1 = _context["catch"](18);
          _didIteratorError = true;
          _iteratorError = _context.t1;

        case 68:
          _context.prev = 68;
          _context.prev = 69;

          if (!_iteratorNormalCompletion && _iterator["return"] != null) {
            _iterator["return"]();
          }

        case 71:
          _context.prev = 71;

          if (!_didIteratorError) {
            _context.next = 74;
            break;
          }

          throw _iteratorError;

        case 74:
          return _context.finish(71);

        case 75:
          return _context.finish(68);

        case 76:
          if (!(attachments.length > 0)) {
            _context.next = 84;
            break;
          }

          txtPath = path.join(tmpDir, "summary.txt");
          fs.writeFileSync(txtPath, summaryText);
          attachments.push(txtPath);
          _context.next = 82;
          return regeneratorRuntime.awrap(sendEmail(config.imap.user, attachments, "Placement Digest"));

        case 82:
          _context.next = 85;
          break;

        case 84:
          console.log("No new placement emails found.");

        case 85:
          connection.end();
          _context.next = 91;
          break;

        case 88:
          _context.prev = 88;
          _context.t2 = _context["catch"](0);
          console.error("❌ Error fetching emails:", _context.t2);

        case 91:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[0, 88], [18, 64, 68, 76], [22, 56], [69,, 71, 75]]);
};

module.exports = {
  fetchEmailsAndCreateEvents: fetchEmailsAndCreateEvents
};