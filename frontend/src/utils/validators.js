export function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function isStrongPassword(value) {
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(value);
}

export function isLicenseNumber(value) {
  return /^[A-Z0-9-]{6,20}$/i.test(value);
}

export function hasOverlap(candidate, currentSlots, currentId = null) {
  const nextStart = new Date(`${candidate.date}T${candidate.startTime}`).valueOf();
  const nextEnd = new Date(`${candidate.date}T${candidate.endTime}`).valueOf();

  return currentSlots.some((slot) => {
    if (currentId && slot.id === currentId) return false;
    if (slot.date !== candidate.date) return false;

    const slotStart = new Date(`${slot.date}T${slot.startTime}`).valueOf();
    const slotEnd = new Date(`${slot.date}T${slot.endTime}`).valueOf();
    return nextStart < slotEnd && nextEnd > slotStart;
  });
}
