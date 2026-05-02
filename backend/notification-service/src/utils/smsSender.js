const twilio = require("twilio");

const sendSms = async ({ to, message }) => {
  try {
    const client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );

    console.log(`Attempting to send SMS to ${to}...`);

    const result = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to,
    });

    console.log(`SMS sent successfully. SID: ${result.sid}`);
    return result;
  } catch (error) {
    console.error(`Twilio SMS Error [to: ${to}]:`, error.message);
    throw error;
  }
};

module.exports = { sendSms };
