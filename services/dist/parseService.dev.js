"use strict";

var chrono = require("chrono-node");

var placementKeywords = ["placement", "internship", "job", "interview", "drive", "offer", "recruitment"];
/**
 * Checks if email is placement-related
 */

var isPlacementEmail = function isPlacementEmail(subject, text) {
  var lowerSubject = (subject || "").toLowerCase();
  var lowerText = (text || "").toLowerCase();
  return placementKeywords.some(function (kw) {
    return lowerSubject.includes(kw) || lowerText.includes(kw);
  });
};
/**
 * Extract structured event info from email
 */


var parsePlacementEmail = function parsePlacementEmail(subject, text) {
  // --- TITLE ---
  var title = subject && subject !== "No Title" ? subject.trim() : "Placement Drive"; // --- COMPANY ---

  var company = "Unknown"; // 1. From subject

  var subjectCompanyMatch = subject.match(/^([A-Za-z& ]+)\s*[-:–]/i);

  if (subjectCompanyMatch) {
    company = subjectCompanyMatch[1].trim();
  } // 2. From body


  if (company === "Unknown") {
    var bodyCompanyMatch = text.match(/(?:Company|Organization|Hiring\s*for|Drive\s*by)\s*[:\-]\s*([A-Z][\w &]+)/i);

    if (bodyCompanyMatch) {
      company = bodyCompanyMatch[1].trim();
    }
  } // 3. First line fallback


  if (company === "Unknown") {
    var firstLine = text.split("\n").map(function (l) {
      return l.trim();
    }).find(function (l) {
      return l.length > 0;
    });

    if (firstLine) {
      var inlineMatch = firstLine.match(/^([A-Z][A-Za-z0-9& ]+)/);
      if (inlineMatch) company = inlineMatch[1].trim();
    }
  } // --- LOCATION ---
  // --- LOCATION ---


  var location = "Online / Not Specified"; // 1. Explicit Venue/Location field

  var locationMatch = text.match(/(?:Venue|Location)\s*[:\-]?\s*([\w ,.-]+)/i);

  if (locationMatch) {
    location = locationMatch[1].trim();
  } else {
    // 2. City names only if preceded by 'at'/'in'/'venue'/'location'
    var cityMatch = text.match(/(?:at|in|venue|location)\s+(Bangalore|Chennai|Hyderabad|Delhi|Mumbai|Pune|Vellore|Gurgaon)/i);

    if (cityMatch) {
      location = cityMatch[1];
    }
  } // --- DATE ---


  var parsedDate = chrono.parseDate(text);

  if (parsedDate && parsedDate < new Date("2020-01-01")) {
    parsedDate = null;
  }

  if (!parsedDate) {
    var monthMatch = text.match(/\b(January|February|March|April|May|June|July|August|September|October|November|December)\s*(\d{4})?/i);

    if (monthMatch) {
      var month = monthMatch[1];
      var year = monthMatch[2] || new Date().getFullYear();
      parsedDate = chrono.parseDate("1 ".concat(month, " ").concat(year));
    }
  }

  if (!parsedDate) return null;
  var start = [parsedDate.getFullYear(), parsedDate.getMonth() + 1, parsedDate.getDate(), parsedDate.getHours() || 9, parsedDate.getMinutes() || 0]; // --- DURATION ---

  var duration = {
    hours: 1,
    minutes: 0
  }; // --- DESCRIPTION ---

  var bodyLines = text.split("\n").map(function (l) {
    return l.trim();
  }).filter(function (l) {
    return l.length > 0 && !l.startsWith("From:") && !l.startsWith("Date:") && !l.startsWith("Subject:");
  });
  var description = bodyLines.slice(0, 20).join("\n"); // --- EXTRA FIELDS ---

  var role = "Not Specified";
  var roleMatch = text.match(/(?:Role|Position|Profile)\s*[:\-]\s*([^\n]+)/i);
  if (roleMatch) role = roleMatch[1].trim();
  var batch = "Not Mentioned";
  var batchMatch = text.match(/(\d{4})\s*Batch/i);
  if (batchMatch) batch = batchMatch[1];
  var deadline = "Not Mentioned";
  var deadlineMatch = chrono.parseDate((text.match(/(Last Date|Deadline|Apply before)[:\-]?\s*([^\n]+)/i) || [])[2]);

  if (deadlineMatch) {
    deadline = deadlineMatch.toDateString();
  }

  var applyLink = null;
  var linkMatch = text.match(/https?:\/\/\S+/i);
  if (linkMatch) applyLink = linkMatch[0];
  var roundInfo = "Not Mentioned";
  var roundMatch = text.match(/(Written Test|Interview|Next Round|GD|HR Round)/i);
  if (roundMatch) roundInfo = roundMatch[1];
  var contact = null;
  var contactMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-z]{2,}/);
  if (contactMatch) contact = contactMatch[0];
  return {
    title: title,
    company: company,
    location: location,
    start: start,
    duration: duration,
    description: description,
    role: role,
    batch: batch,
    deadline: deadline,
    applyLink: applyLink,
    roundInfo: roundInfo,
    contact: contact
  };
};

module.exports = {
  isPlacementEmail: isPlacementEmail,
  parsePlacementEmail: parsePlacementEmail
};