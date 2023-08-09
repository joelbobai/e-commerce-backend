const OTP = require("./model");
const generateOTP = require("./../../util/generateOTP");
const sendEmail = require("./../../util/sendEmail");
const { hashData, verifyHashedData } = require("./../../util/hashData");

const verifyOTP = async ({ email, otp }) => {
  try {
    if (!(email && otp)) {
      throw Error("Provide values for email, otp");
    }

    // ensure otp record exists
    const matchedOTPRecord = await OTP.findOne({ email });

    if (!matchedOTPRecord) {
      throw Error("No otp records found.");
    }

    const { expiresAt } = matchedOTPRecord;
    if (expiresAt < Date.now()) {
      throw Error("Code has expired. Request for a new one.");
    }

    // not expired yet, verify value
    const hashedOTP = matchedOTPRecord.otp;
    const validOTP = await verifyHashedData(otp, hashedOTP);

    return validOTP;
  } catch (error) {
    throw error;
  }
};

const sendOTP = async ({ email, subject, message, duration = 1 }) => {
  try {
    if (!(email && subject && message)) {
      throw Error("Provide values for email, subject, message");
    }

    // clear any old record
    await OTP.deleteOne({ email });

    // generate pin
    const generatedOTP = await generateOTP();
    const currentUrl = `http://localhost:3001/api/v1/email_verification/verify/${email}/${generatedOTP}`;

    // send email
    const mailOptions = {
      from: "E-COMMERCE <joelisaiahbobai@gmail.com>",
      to: email,
      subject,
      html: `<!DOCTYPE html>
      <html>
        <head>
          <style>
            /* Embedded CSS */
            html,
            body {
              height: 100%;
              width: 100%;
              font-family: Arial, sans-serif;
              background-color: #f5f5f5;
              margin: 0;
              padding: 0;
              display: flex;
              justify-content: center;
              align-items: center;
            }
      
            .container {
              width: 90%;
      
              margin: 0 auto;
              padding: 20px;
              background-color: #ffffff;
              border-radius: 10px;
              box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.1);
            }
      
            .header {
              background-color: #007bff;
              color: #ffffff;
              padding: 10px 0;
              text-align: center;
              border-top-left-radius: 10px;
              border-top-right-radius: 10px;
            }
      
            .content {
              padding: 20px;
            }
      
            .verify-button {
              display: inline-block;
              background-color: #007bff;
              color: #ffffff;
              padding: 10px 20px;
              border-radius: 5px;
              text-decoration: none;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Email Verification</h1>
            </div>
            <div class="content">
              <p>Hello 👋,</p>
              <p>${message}<strong>${generatedOTP}</strong>.</p>
              <p>Click the button below to verify your account:</p>
              <a href=${currentUrl} class="verify-button">Verify Account</a>
              <p>expires in ${duration} hour(s) </p>
            </div>
          </div>
        </body>
      </html>`,
    };
    await sendEmail(mailOptions);
    // save otp record

    const hashedOTP = await hashData(generatedOTP);

    const newOTP = await new OTP({
      email,
      otp: hashedOTP,
      createdAt: Date.now(),
      expiresAt: Date.now() + 3600000 * +duration,
    });

    const createdOTPRecord = await newOTP.save();
    return createdOTPRecord;
  } catch (error) {
    throw error;
  }
};

const deleteOTP = async (email) => {
  try {
    await OTP.deleteOne({ email });
  } catch (err) {
    throw err;
  }
};

module.exports = { sendOTP, verifyOTP, deleteOTP };
