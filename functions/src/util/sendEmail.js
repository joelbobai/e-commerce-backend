const nodemailer = require("nodemailer");
const smtpTransport = require("nodemailer-smtp-transport");
const { AUTH_EMAIL, AUTH_PASS } = process.env;
let transporter = nodemailer.createTransport(
  smtpTransport({
    // service: "outlook",
    // host: "smtp-mail.outlook.com",
    service: "gmail",
    host: "smtp.gmail.com",
    auth: {
      user: AUTH_EMAIL,
      pass: AUTH_PASS,
    },
  })
);

// test transporter
transporter.verify((error, success) => {
  if (error) {
    console.log(error);
  } else {
    console.log("Mail Is Ready");
    console.log(success);
  }
});

const sendEmail = async (mailOptions) => {
  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    throw error;
  }
};

module.exports = sendEmail;
