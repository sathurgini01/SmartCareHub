const crypto = require("crypto");

const TOKEN_TTL_SECONDS = Number(process.env.VIDEO_TOKEN_TTL_SECONDS || 3600);

const base64Url = (input) =>
  Buffer.from(input)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

const signJwt = (payload, secret, header = {}) => {
  const encodedHeader = base64Url(JSON.stringify({ typ: "JWT", alg: "HS256", ...header }));
  const encodedPayload = base64Url(JSON.stringify(payload));
  const signature = crypto
    .createHmac("sha256", secret)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

  return `${encodedHeader}.${encodedPayload}.${signature}`;
};

const getIdentity = (session, role, userId) => {
  const displayName = role === "doctor" ? session.doctorName : session.patientName;
  return String(displayName || `${role}-${userId}`).replace(/\s+/g, "-").toLowerCase();
};

const buildJitsiConnection = (session) => ({
  provider: "jitsi",
  roomName: session.sessionRoom,
  meetingUrl: session.sessionLink,
  embedUrl: session.sessionLink,
  token: null,
  expiresIn: null,
  setupRequired: false,
});

const buildTwilioConnection = (session, identity) => {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const apiKey = process.env.TWILIO_API_KEY || process.env.TWILIO_API_KEY_SID;
  const apiSecret = process.env.TWILIO_API_SECRET || process.env.TWILIO_AUTH_TOKEN;

  if (!accountSid || !apiKey || !apiSecret || apiKey.startsWith("your_")) {
    return {
      provider: "twilio",
      roomName: session.sessionRoom,
      token: null,
      expiresIn: TOKEN_TTL_SECONDS,
      setupRequired: true,
      message: "Set TWILIO_ACCOUNT_SID, TWILIO_API_KEY, and TWILIO_API_SECRET to generate Twilio Video tokens.",
    };
  }

  const now = Math.floor(Date.now() / 1000);
  const payload = {
    jti: `${apiKey}-${now}`,
    iss: apiKey,
    sub: accountSid,
    exp: now + TOKEN_TTL_SECONDS,
    grants: {
      identity,
      video: {
        room: session.sessionRoom,
      },
    },
  };

  return {
    provider: "twilio",
    roomName: session.sessionRoom,
    token: signJwt(payload, apiSecret, { cty: "twilio-fpa;v=1" }),
    expiresIn: TOKEN_TTL_SECONDS,
    setupRequired: false,
  };
};

const tryLoadAgoraBuilder = () => {
  try {
    return require("agora-access-token").RtcTokenBuilder;
  } catch (_error) {
    return null;
  }
};

const buildAgoraConnection = (session, role, userId) => {
  const appId = process.env.AGORA_APP_ID;
  const appCertificate = process.env.AGORA_APP_CERTIFICATE;
  const channelName = session.sessionRoom;
  const uid = crypto.createHash("sha1").update(`${role}:${userId}`).digest().readUInt32BE(0);

  if (!appId || appId.startsWith("your_")) {
    return {
      provider: "agora",
      appId: appId || "",
      channelName,
      uid,
      token: null,
      expiresIn: TOKEN_TTL_SECONDS,
      setupRequired: true,
      message: "Set AGORA_APP_ID and AGORA_APP_CERTIFICATE to generate Agora RTC tokens.",
    };
  }

  if (!appCertificate || appCertificate.startsWith("your_")) {
    return {
      provider: "agora",
      appId,
      channelName,
      uid,
      token: null,
      expiresIn: TOKEN_TTL_SECONDS,
      setupRequired: true,
      message: "AGORA_APP_CERTIFICATE is missing. Use App ID only mode in Agora for testing, or add the certificate and agora-access-token package for secured tokens.",
    };
  }

  const RtcTokenBuilder = tryLoadAgoraBuilder();
  if (!RtcTokenBuilder) {
    return {
      provider: "agora",
      appId,
      channelName,
      uid,
      token: null,
      expiresIn: TOKEN_TTL_SECONDS,
      setupRequired: true,
      message: "Install the agora-access-token package in telemedicine-service to generate official Agora RTC tokens.",
    };
  }

  const roleValue = 1; // publisher
  const now = Math.floor(Date.now() / 1000);
  const expiresAt = now + TOKEN_TTL_SECONDS;

  return {
    provider: "agora",
    appId,
    channelName,
    uid,
    token: RtcTokenBuilder.buildTokenWithUid(appId, appCertificate, channelName, uid, roleValue, expiresAt),
    expiresIn: TOKEN_TTL_SECONDS,
    setupRequired: false,
  };
};

const buildVideoConnection = (session, { role, userId }) => {
  const provider = session.provider || process.env.VIDEO_PROVIDER || "jitsi";
  const identity = getIdentity(session, role, userId);

  const common = {
    sessionId: session.id,
    appointmentId: session.appointmentId,
    provider,
    identity,
    role,
    status: session.status,
  };

  if (provider === "twilio") {
    return { ...common, ...buildTwilioConnection(session, identity) };
  }

  if (provider === "agora") {
    return { ...common, ...buildAgoraConnection(session, role, userId) };
  }

  return { ...common, ...buildJitsiConnection(session) };
};

module.exports = {
  buildVideoConnection,
};
