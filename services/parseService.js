const chrono = require("chrono-node");

// Keywords to detect placement emails
const placementKeywords = [
  "placement", "internship", "job", "interview", "drive", "offer", "recruitment"
];

/**
 * Checks if email is placement-related
 */
const isPlacementEmail = (subject, text) => {
  const lowerSubject = subject.toLowerCase();
  const lowerText = text.toLowerCase();
  return placementKeywords.some(kw => lowerSubject.includes(kw) || lowerText.includes(kw));
};

/**
 * Extract structured event info from email text
 */
const parsePlacementEmail = (subject, text) => {
  // Title is email subject
  const title = subject;

  // Extract company (simple regex approach)
  const companyMatch = text.match(/(?:Company|Organization|By|at)\s*:\s*([A-Z][a-zA-Z0-9 &]*)/i);
  const company = companyMatch ? companyMatch[1] : "Unknown";

  // Extract location
  const locationMatch = text.match(/(?:Venue|Location|at)\s*:\s*([\w ,.-]+)/i);
  const location = locationMatch ? locationMatch[1] : "Online / Not Specified";

  // Extract first date/time using chrono-node
  const parsedDate = chrono.parseDate(text);
  if (!parsedDate) return null; // skip if no date found

  const start = [
    parsedDate.getFullYear(),
    parsedDate.getMonth() + 1,
    parsedDate.getDate(),
    parsedDate.getHours(),
    parsedDate.getMinutes(),
  ];

  // Default duration
  const duration = { hours: 1, minutes: 0 };

  return { title, company, location, start, duration, description: text };
};

module.exports = { isPlacementEmail, parsePlacementEmail };
