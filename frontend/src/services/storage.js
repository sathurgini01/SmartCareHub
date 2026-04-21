import { buildInitialState } from './mockData';

const DB_KEY = 'smartcare-platform-db';
const SESSION_KEY = 'smartcare-platform-session';
const LEGACY_TOKEN_KEY = 'token';

function readStorage(storage, key) {
  try {
    return storage.getItem(key);
  } catch (_error) {
    return null;
  }
}

function writeStorage(storage, key, value) {
  try {
    if (value === null || value === undefined) {
      storage.removeItem(key);
    } else {
      storage.setItem(key, value);
    }
  } catch (_error) {
    // Ignore storage write failures so the app can keep working in limited environments.
  }
}

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
  const raw = readStorage(sessionStorage, SESSION_KEY);
  return raw ? JSON.parse(raw) : null;
}

export function setSession(session) {
  const serialized = JSON.stringify(session);
  writeStorage(sessionStorage, SESSION_KEY, serialized);
  writeStorage(localStorage, SESSION_KEY, null);
  if (session?.token) {
    writeStorage(sessionStorage, LEGACY_TOKEN_KEY, session.token);
    writeStorage(localStorage, LEGACY_TOKEN_KEY, null);
  } else {
    writeStorage(sessionStorage, LEGACY_TOKEN_KEY, null);
    writeStorage(localStorage, LEGACY_TOKEN_KEY, null);
  }
}

export function clearSession() {
  writeStorage(sessionStorage, SESSION_KEY, null);
  writeStorage(localStorage, SESSION_KEY, null);
  writeStorage(sessionStorage, LEGACY_TOKEN_KEY, null);
  writeStorage(localStorage, LEGACY_TOKEN_KEY, null);
}

export function getAccessToken() {
  const session = getSession();
  return (
    session?.token ||
    readStorage(sessionStorage, LEGACY_TOKEN_KEY) ||
    ''
  );
}

export function wait(data, delay = 220) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(data), delay);
  });
}
