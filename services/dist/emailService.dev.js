"use strict";

var nodemailer = require("nodemailer");

var fs = require("fs");

var sendEmail = function sendEmail(to, filePaths) {
  var subject,
      transporter,
      files,
      attachments,
      mailOptions,
      _args = arguments;
  return regeneratorRuntime.async(function sendEmail$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          subject = _args.length > 2 && _args[2] !== undefined ? _args[2] : "Your Placements Digest";
          _context.prev = 1;
          transporter = nodemailer.createTransport({
            service: "gmail",
            // you can switch to "outlook" etc.
            auth: {
              user: process.env.EMAIL_USER,
              pass: process.env.EMAIL_PASS
            }
          }); // Ensure filePaths is always an array

          files = Array.isArray(filePaths) ? filePaths : [filePaths]; // Convert file paths into attachment objects

          attachments = files.map(function (filePath) {
            return {
              filename: filePath.split("/").pop(),
              // use original file name
              content: fs.readFileSync(filePath)
            };
          });
          mailOptions = {
            from: process.env.EMAIL_USER,
            to: to,
            subject: subject,
            text: "Attached are your placement events (.ics files + summary.txt).",
            attachments: attachments
          };
          _context.next = 8;
          return regeneratorRuntime.awrap(transporter.sendMail(mailOptions));

        case 8:
          console.log("\uD83D\uDCE9 Email sent to ".concat(to));
          _context.next = 15;
          break;

        case 11:
          _context.prev = 11;
          _context.t0 = _context["catch"](1);
          console.error("❌ Error sending email:", _context.t0);
          throw _context.t0;

        case 15:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[1, 11]]);
};

module.exports = {
  sendEmail: sendEmail
};