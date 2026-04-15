// Format currency
export const formatCurrency = (amount, currency = 'LKR') => {
  return new Intl.NumberFormat('en-LK', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2
  }).format(amount);
};

// Format date
export const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

// Format date (long)
export const formatDateLong = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Format time (12hr)
export const formatTime = (timeStr) => {
  if (!timeStr) return '';
  const [hours, minutes] = timeStr.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${String(minutes).padStart(2, '0')} ${period}`;
};

// Get status color class
export const getStatusBadge = (status) => {
  const statusMap = {
    pending: 'badge-pending',
    confirmed: 'badge-confirmed',
    'in-progress': 'badge-in-progress',
    completed: 'badge-completed',
    cancelled: 'badge-cancelled',
    'no-show': 'badge-no-show',
    paid: 'badge-paid',
    unpaid: 'badge-unpaid',
    refunded: 'badge-refunded',
    processing: 'badge-processing',
    failed: 'badge-failed'
  };
  return statusMap[status] || 'badge-pending';
};

// Get relative time (e.g., "2 hours ago")
export const getRelativeTime = (dateStr) => {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(dateStr);
};

// Get specialty icon (emoji)
export const getSpecialtyIcon = (specialty) => {
  const icons = {
    'General Medicine': '🩺',
    'Cardiology': '❤️',
    'Dermatology': '🧴',
    'Neurology': '🧠',
    'Orthopedics': '🦴',
    'Pediatrics': '👶',
    'Gynecology': '🤱',
    'Ophthalmology': '👁️',
    'ENT': '👂',
    'Psychiatry': '🧘',
    'Dental': '🦷'
  };
  return icons[specialty] || '⚕️';
};
