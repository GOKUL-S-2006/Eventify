"use strict";

var ics = require("ics");

var fs = require("fs");

var path = require("path");

var generateICS = function generateICS(_ref) {
  var title, description, start, duration;
  return regeneratorRuntime.async(function generateICS$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          title = _ref.title, description = _ref.description, start = _ref.start, duration = _ref.duration;
          return _context.abrupt("return", new Promise(function (resolve, reject) {
            var event = {
              title: title,
              description: description,
              start: start,
              duration: duration
            };
            ics.createEvent(event, function (error, value) {
              if (error) return reject(error); // Ensure "temp" directory exists

              var tempDir = path.join(__dirname, "../temp");

              if (!fs.existsSync(tempDir)) {
                fs.mkdirSync(tempDir, {
                  recursive: true
                });
              } // Safe filename


              var safeTitle = (title || "event").replace(/[^a-z0-9]/gi, "_").toLowerCase();
              var filePath = path.join(tempDir, "".concat(safeTitle, "_").concat(Date.now(), ".ics"));
              fs.writeFileSync(filePath, value);
              resolve(filePath);
            });
          }));

        case 2:
        case "end":
          return _context.stop();
      }
    }
  });
};

module.exports = {
  generateICS: generateICS
};