"use strict";

var chrono = require("chrono-node"); // Keywords to detect placement emails


var placementKeywords = ["placement", "internship", "job", "interview", "drive", "offer", "recruitment"];
/**
 * Checks if email is placement-related
 */

var isPlacementEmail = function isPlacementEmail(subject, text) {
  var lowerSubject = subject.toLowerCase();
  var lowerText = text.toLowerCase();
  return placementKeywords.some(function (kw) {
    return lowerSubject.includes(kw) || lowerText.includes(kw);
  });
};
/**
 * Extract structured event info from email text
 */


var parsePlacementEmail = function parsePlacementEmail(subject, text) {
  // Title is email subject
  var title = subject; // Extract company (simple regex approach)

  var companyMatch = text.match(/(?:Company|Organization|By|at)\s*:\s*([A-Z][a-zA-Z0-9 &]*)/i);
  var company = companyMatch ? companyMatch[1] : "Unknown"; // Extract location

  var locationMatch = text.match(/(?:Venue|Location|at)\s*:\s*([\w ,.-]+)/i);
  var location = locationMatch ? locationMatch[1] : "Online / Not Specified"; // Extract first date/time using chrono-node

  var parsedDate = chrono.parseDate(text);
  if (!parsedDate) return null; // skip if no date found

  var start = [parsedDate.getFullYear(), parsedDate.getMonth() + 1, parsedDate.getDate(), parsedDate.getHours(), parsedDate.getMinutes()]; // Default duration

  var duration = {
    hours: 1,
    minutes: 0
  };
  return {
    title: title,
    company: company,
    location: location,
    start: start,
    duration: duration,
    description: text
  };
};

module.exports = {
  isPlacementEmail: isPlacementEmail,
  parsePlacementEmail: parsePlacementEmail
};