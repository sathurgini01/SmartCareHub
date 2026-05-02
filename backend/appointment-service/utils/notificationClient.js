const axios = require('axios');

const NOTIFICATION_SERVICE_URL = process.env.NOTIFICATION_SERVICE_URL || 'http://notification-service:5005/api/notifications';

const sendNotification = async (payload) => {
  try {
    const results = [];
    
    // Always try to send Email if email is provided
    if (payload.recipientEmail) {
      console.log(`Sending email notification to ${payload.recipientEmail}`);
      const emailRes = await axios.post(`${NOTIFICATION_SERVICE_URL}/send-email`, {
        ...payload,
        category: payload.category || 'booking_confirmation'
      }, {
        headers: { 'x-system-key': 'SMARTCARE-SYSTEM-KEY-2026' }
      });
      results.push(emailRes.data);
    }
    
    // Also try to send SMS if phone is provided
    if (payload.recipientPhone) {
      console.log(`Sending SMS notification to ${payload.recipientPhone}`);
      const smsRes = await axios.post(`${NOTIFICATION_SERVICE_URL}/send-sms`, {
        ...payload,
        category: payload.category || 'booking_confirmation'
      }, {
        headers: { 'x-system-key': 'SMARTCARE-SYSTEM-KEY-2026' }
      });
      results.push(smsRes.data);
    }
    
    return results;
  } catch (error) {
    console.error('Failed to trigger notification:', error.response?.data || error.message);
    return null;
  }
};

module.exports = { sendNotification };
