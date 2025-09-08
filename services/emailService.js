const nodemailer = require("nodemailer");
const fs = require("fs");

const sendEmail = async (to, filePaths, subject = "Your Placements Digest") => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail", // you can switch to "outlook" etc.
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Ensure filePaths is always an array
    const files = Array.isArray(filePaths) ? filePaths : [filePaths];

    // Convert file paths into attachment objects
    const attachments = files.map((filePath) => ({
      filename: filePath.split("/").pop(), // use original file name
      content: fs.readFileSync(filePath),
    }));

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      text: "Attached are your placement events (.ics files + summary.txt).",
      attachments,
    };

    await transporter.sendMail(mailOptions);
    console.log(`📩 Email sent to ${to}`);
  } catch (error) {
    console.error("❌ Error sending email:", error);
    throw error;
  }
};

module.exports = { sendEmail };
