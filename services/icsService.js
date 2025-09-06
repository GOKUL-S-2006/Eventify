const ics = require("ics");
const fs = require("fs");
const path = require("path");

const generateICS = async ({ title, description, start, duration }) => {
  return new Promise((resolve, reject) => {
    const event = { title, description, start, duration };

    ics.createEvent(event, (error, value) => {
      if (error) return reject(error);

      // Ensure "temp" directory exists
      const tempDir = path.join(__dirname, "../temp");
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }

      // Safe filename
      const safeTitle = (title || "event").replace(/[^a-z0-9]/gi, "_").toLowerCase();
      const filePath = path.join(tempDir, `${safeTitle}_${Date.now()}.ics`);

      fs.writeFileSync(filePath, value);

      resolve(filePath);
    });
  });
};

module.exports = { generateICS };
