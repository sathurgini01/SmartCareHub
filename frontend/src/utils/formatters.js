// Date/Time Formatters
export function formatDate(value) {
  if (!value) return 'Not available';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

export function formatDateTime(value) {
  if (!value) return 'Not available';
  return new Date(value).toLocaleString();
}

export function formatDateLong(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

export function formatTime(value) {
  if (!value) return 'Not available';
  if (value.includes(':')) {
    const [hours, minutes] = value.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${String(minutes).padStart(2, '0')} ${period}`;
  }
  return new Date(`2026-01-01T${value}`).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Currency Formatter
export const formatCurrency = (amount, currency = 'LKR') => {
  return new Intl.NumberFormat('en-LK', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2
  }).format(amount);
};

// UI Helpers
export function initials(name = '') {
  return (
    name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('') || 'SC'
  );
}

export function createId(prefix) {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}`;
}

// Status Badges & Icons
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
