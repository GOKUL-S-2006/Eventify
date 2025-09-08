const chrono = require("chrono-node");

const placementKeywords = [
  "placement", "internship", "job", "interview", "drive", "offer", "recruitment"
];

/**
 * Checks if email is placement-related
 */
const isPlacementEmail = (subject, text) => {
  const lowerSubject = (subject || "").toLowerCase();
  const lowerText = (text || "").toLowerCase();
  return placementKeywords.some(
    (kw) => lowerSubject.includes(kw) || lowerText.includes(kw)
  );
};

/**
 * Extract structured event info from email
 */
const parsePlacementEmail = (subject, text) => {
  // --- TITLE ---
  const title =
    subject && subject !== "No Title"
      ? subject.trim()
      : "Placement Drive";

  // --- COMPANY ---
  let company = "Unknown";

  // 1. From subject
  const subjectCompanyMatch = subject.match(/^([A-Za-z& ]+)\s*[-:–]/i);
  if (subjectCompanyMatch) {
    company = subjectCompanyMatch[1].trim();
  }

  // 2. From body
  if (company === "Unknown") {
    const bodyCompanyMatch = text.match(
      /(?:Company|Organization|Hiring\s*for|Drive\s*by)\s*[:\-]\s*([A-Z][\w &]+)/i
    );
    if (bodyCompanyMatch) {
      company = bodyCompanyMatch[1].trim();
    }
  }

  // 3. First line fallback
  if (company === "Unknown") {
    const firstLine = text
      .split("\n")
      .map((l) => l.trim())
      .find((l) => l.length > 0);
    if (firstLine) {
      const inlineMatch = firstLine.match(/^([A-Z][A-Za-z0-9& ]+)/);
      if (inlineMatch) company = inlineMatch[1].trim();
    }
  }

  // --- LOCATION ---
  // --- LOCATION ---
let location = "Online / Not Specified";

// 1. Explicit Venue/Location field
const locationMatch = text.match(
  /(?:Venue|Location)\s*[:\-]?\s*([\w ,.-]+)/i
);
if (locationMatch) {
  location = locationMatch[1].trim();
} else {
  // 2. City names only if preceded by 'at'/'in'/'venue'/'location'
  const cityMatch = text.match(
    /(?:at|in|venue|location)\s+(Bangalore|Chennai|Hyderabad|Delhi|Mumbai|Pune|Vellore|Gurgaon)/i
  );
  if (cityMatch) {
    location = cityMatch[1];
  }
}


  // --- DATE ---
  let parsedDate = chrono.parseDate(text);
  if (parsedDate && parsedDate < new Date("2020-01-01")) {
    parsedDate = null;
  }
  if (!parsedDate) {
    const monthMatch = text.match(
      /\b(January|February|March|April|May|June|July|August|September|October|November|December)\s*(\d{4})?/i
    );
    if (monthMatch) {
      const month = monthMatch[1];
      const year = monthMatch[2] || new Date().getFullYear();
      parsedDate = chrono.parseDate(`1 ${month} ${year}`);
    }
  }
  if (!parsedDate) return null;

  const start = [
    parsedDate.getFullYear(),
    parsedDate.getMonth() + 1,
    parsedDate.getDate(),
    parsedDate.getHours() || 9,
    parsedDate.getMinutes() || 0,
  ];

  // --- DURATION ---
  const duration = { hours: 1, minutes: 0 };

  // --- DESCRIPTION ---
  const bodyLines = text
    .split("\n")
    .map((l) => l.trim())
    .filter(
      (l) =>
        l.length > 0 &&
        !l.startsWith("From:") &&
        !l.startsWith("Date:") &&
        !l.startsWith("Subject:")
    );
  const description = bodyLines.slice(0, 20).join("\n");

  // --- EXTRA FIELDS ---
  let role = "Not Specified";
  const roleMatch = text.match(/(?:Role|Position|Profile)\s*[:\-]\s*([^\n]+)/i);
  if (roleMatch) role = roleMatch[1].trim();

  let batch = "Not Mentioned";
  const batchMatch = text.match(/(\d{4})\s*Batch/i);
  if (batchMatch) batch = batchMatch[1];

  let deadline = "Not Mentioned";
  const deadlineMatch = chrono.parseDate(
    (text.match(/(Last Date|Deadline|Apply before)[:\-]?\s*([^\n]+)/i) || [])[2]
  );
  if (deadlineMatch) {
    deadline = deadlineMatch.toDateString();
  }

  let applyLink = null;
  const linkMatch = text.match(/https?:\/\/\S+/i);
  if (linkMatch) applyLink = linkMatch[0];

  let roundInfo = "Not Mentioned";
  const roundMatch = text.match(/(Written Test|Interview|Next Round|GD|HR Round)/i);
  if (roundMatch) roundInfo = roundMatch[1];

  let contact = null;
  const contactMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-z]{2,}/);
  if (contactMatch) contact = contactMatch[0];

  return { 
    title, 
    company, 
    location, 
    start, 
    duration, 
    description,
    role,
    batch,
    deadline,
    applyLink,
    roundInfo,
    contact
  };
};

module.exports = { isPlacementEmail, parsePlacementEmail };
