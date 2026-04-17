import { buildInitialState } from './mockData';

const DB_KEY = 'smartcare-platform-db';
const SESSION_KEY = 'smartcare-platform-session';
const LEGACY_TOKEN_KEY = 'token';

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
  const raw = sessionStorage.getItem(SESSION_KEY);
  return raw ? JSON.parse(raw) : null;
}

export function setSession(session) {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
  if (session?.token) {
    sessionStorage.setItem(LEGACY_TOKEN_KEY, session.token);
  } else {
    sessionStorage.removeItem(LEGACY_TOKEN_KEY);
  }
}

export function clearSession() {
  sessionStorage.removeItem(SESSION_KEY);
  sessionStorage.removeItem(LEGACY_TOKEN_KEY);
}

export function getAccessToken() {
  const session = getSession();
  return session?.token || sessionStorage.getItem(LEGACY_TOKEN_KEY) || '';
}

export function wait(data, delay = 220) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(data), delay);
  });
}
