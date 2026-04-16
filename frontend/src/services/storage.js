import { buildInitialState } from './mockData';

const DB_KEY = 'smartcare-platform-db';
const SESSION_KEY = 'smartcare-platform-session';

export function getDb() {
  const raw = localStorage.getItem(DB_KEY);

  if (!raw) {
    const initial = buildInitialState();
    localStorage.setItem(DB_KEY, JSON.stringify(initial));
    return initial;
  }

  return JSON.parse(raw);
}

export function setDb(nextDb) {
  localStorage.setItem(DB_KEY, JSON.stringify(nextDb));
}

export function getSession() {
  const raw = localStorage.getItem(SESSION_KEY);
  return raw ? JSON.parse(raw) : null;
}

export function setSession(session) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

export function wait(data, delay = 220) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(data), delay);
  });
}
