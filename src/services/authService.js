const crypto = require('node:crypto');
const { db } = require('../db/database');

const JWT_SECRET = process.env.JWT_SECRET || 'brightloop_super_secret_jwt_key_2026';

// Password policy validator: > 8 chars, 1 uppercase, 1 lowercase, 1 special char
function validatePassword(password) {
  if (!password || typeof password !== 'string') return false;
  if (password.length <= 8) return false;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
  return hasUpper && hasLower && hasSpecial;
}

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = crypto.scryptSync(password, salt, 64);
  return `${salt}:${derivedKey.toString('hex')}`;
}

function verifyPassword(password, storedHash) {
  try {
    const [salt, key] = storedHash.split(':');
    const keyBuffer = Buffer.from(key, 'hex');
    const derivedKey = crypto.scryptSync(password, salt, 64);
    return crypto.timingSafeEqual(keyBuffer, derivedKey);
  } catch (err) {
    return false;
  }
}

// Lightweight JWT implementation using HMAC SHA-256
function createToken(payload, expiresInSeconds = 86400) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const exp = Math.floor(Date.now() / 1000) + expiresInSeconds;
  const fullPayload = { ...payload, exp };

  const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
  const encodedPayload = Buffer.from(JSON.stringify(fullPayload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest('base64url');

  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

function verifyToken(token) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [encodedHeader, encodedPayload, signature] = parts;

    const expectedSig = crypto
      .createHmac('sha256', JWT_SECRET)
      .update(`${encodedHeader}.${encodedPayload}`)
      .digest('base64url');

    if (expectedSig !== signature) return null;

    const payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf8'));
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null; // Expired
    }
    return payload;
  } catch (err) {
    return null;
  }
}

function registerUser({ email, password, name, role = 'Customer' }) {
  if (!email || !email.includes('@')) {
    throw new Error('A valid email address is required.');
  }

  if (!validatePassword(password)) {
    throw new Error(
      'Password must be more than 8 characters and include at least one uppercase letter, one lowercase letter, and one special character.'
    );
  }

  const existing = db.prepare('SELECT id FROM users WHERE email = ? COLLATE NOCASE').get(email.trim());
  if (existing) {
    throw new Error('An account with this email already exists.');
  }

  const id = crypto.randomUUID();
  const password_hash = hashPassword(password);
  const cleanEmail = email.trim().toLowerCase();

  db.prepare(`
    INSERT INTO users (id, email, password_hash, name, role)
    VALUES (?, ?, ?, ?, ?)
  `).run(id, cleanEmail, password_hash, name || cleanEmail.split('@')[0], role);

  const token = createToken({ id, email: cleanEmail, role, name: name || cleanEmail.split('@')[0] });
  return { id, email: cleanEmail, role, name: name || cleanEmail.split('@')[0], token };
}

function loginUser(email, password) {
  if (!email || !password) {
    throw new Error('Email and password are required.');
  }

  const user = db.prepare('SELECT * FROM users WHERE email = ? COLLATE NOCASE').get(email.trim());
  if (!user || !verifyPassword(password, user.password_hash)) {
    throw new Error('Invalid email or password.');
  }

  const token = createToken({ id: user.id, email: user.email, role: user.role, name: user.name });
  return { id: user.id, email: user.email, role: user.role, name: user.name, token };
}

function forgotPassword(email) {
  const user = db.prepare('SELECT id, email FROM users WHERE email = ? COLLATE NOCASE').get(email.trim());
  if (!user) {
    // Return friendly message even if user doesn't exist for privacy
    return { success: true, message: 'If this email exists in our records, a reset token has been generated.' };
  }

  const token = crypto.randomBytes(32).toString('hex');
  const expires_at = new Date(Date.now() + 3600000).toISOString(); // 1 hour

  db.prepare(`
    INSERT INTO reset_tokens (token, user_id, expires_at, used)
    VALUES (?, ?, ?, 0)
  `).run(token, user.id, expires_at);

  return {
    success: true,
    message: 'Reset token generated successfully.',
    resetToken: token,
    expiresAt: expires_at
  };
}

function resetPassword(token, newPassword) {
  if (!validatePassword(newPassword)) {
    throw new Error(
      'Password must be more than 8 characters and include at least one uppercase letter, one lowercase letter, and one special character.'
    );
  }

  const record = db.prepare(`
    SELECT * FROM reset_tokens 
    WHERE token = ? AND used = 0 AND expires_at > datetime('now')
  `).get(token);

  if (!record) {
    throw new Error('Reset token is invalid or has expired.');
  }

  const password_hash = hashPassword(newPassword);
  db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(password_hash, record.user_id);
  db.prepare('UPDATE reset_tokens SET used = 1 WHERE token = ?').run(token);

  return { success: true, message: 'Password has been updated successfully.' };
}

module.exports = {
  validatePassword,
  hashPassword,
  verifyPassword,
  createToken,
  verifyToken,
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword
};
