const validatePaymentCreate = (req, res, next) => {
  const { appointmentId, amount, patientName, patientEmail } = req.body;
  const errors = [];

  if (!appointmentId) errors.push('Appointment ID is required');
  if (!amount || amount <= 0) errors.push('Valid amount is required');
  if (!patientName) errors.push('Patient name is required');
  if (!patientEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(patientEmail)) {
    errors.push('Valid patient email is required');
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, errors });
  }

  next();
};

const validateRefund = (req, res, next) => {
  const { reason } = req.body;
  
  if (!reason || reason.trim().length < 5) {
    return res.status(400).json({ 
      success: false, 
      message: 'Refund reason is required (minimum 5 characters)' 
    });
  }

  next();
};

module.exports = { validatePaymentCreate, validateRefund };
