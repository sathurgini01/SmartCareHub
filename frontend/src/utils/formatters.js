export function formatDate(value) {
  if (!value) return 'Not available';
  return new Date(value).toLocaleDateString();
}

export function formatDateTime(value) {
  if (!value) return 'Not available';
  return new Date(value).toLocaleString();
}

export function formatTime(value) {
  if (!value) return 'Not available';
  return new Date(`2026-01-01T${value}`).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  });
}

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
