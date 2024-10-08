const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
dotenv.config();

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const sendInviteEmail = async (to, link) => {
  const mailOptions = {
    from: process.env.EMAIL,
    to,
    subject: "Connect Your Mobile Device",
    html: `
      <p>Hello,</p>
      <p>Please click the link below to connect your mobile device to your account:</p>
      <a href="${link}">Connect Device</a>
      <p>This link will expire in 24 hours and can only be used once.</p>
    `,
  };

  return transporter.sendMail(mailOptions);
};

const send2FAEmail = async (to, code) => {
  const mailOptions = {
    from: process.env.EMAIL,
    to,
    subject: "2FA Verification Code",
    html: `<p>Your 2FA code is: <strong>${code}</strong></p>`,
  };

  return transporter.sendMail(mailOptions);
};

export { send2FAEmail };

module.exports = { sendInviteEmail };
