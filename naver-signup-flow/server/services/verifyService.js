// 휴대폰 인증: 한 번호당 월 1회 발송, 3분 만료 (실제 문자는 보내지 않는다)
const crypto = require('crypto');
const db = require('../db/database');
const config = require('../config');

/** 번호는 그대로 저장하지 않고 해시로만 남긴다 */
function phoneKey(country, phone) {
  return crypto.createHash('sha256').update(`${country}:${phone}`).digest('hex');
}

/** 한국 시간 기준 'YYYY-MM' */
function monthKey(now = new Date()) {
  const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  return kst.toISOString().slice(0, 7);
}

function validatePhone(country, phone) {
  const digits = String(phone || '').replace(/\D/g, '');
  if (country === '+82') return /^01[016789]\d{7,8}$/.test(digits) ? digits : null;
  return digits.length >= 6 && digits.length <= 15 ? digits : null;
}

function send({ country = '+82', phone }) {
  const digits = validatePhone(country, phone);
  if (!digits) return { status: 'invalid', message: '휴대전화 번호 형식을 확인해 주세요.' };

  const key = phoneKey(country, digits);
  const month = monthKey();
  const used = db
    .prepare('SELECT COUNT(*) AS n FROM verifications WHERE phone_key = ? AND month_key = ?')
    .get(key, month).n;

  if (used >= config.verify.monthlyLimit) {
    return {
      status: 'limit',
      message: '이번 달에 이미 인증번호를 받았어요. 문자로 받은 번호를 그대로 입력해 주세요.',
      limit: config.verify.monthlyLimit,
    };
  }

  const code = String(crypto.randomInt(0, 1000000)).padStart(6, '0');
  const expiresAt = Date.now() + config.verify.codeTtlSeconds * 1000;
  db.prepare('INSERT INTO verifications (phone_key, month_key, code, expires_at) VALUES (?, ?, ?, ?)')
    .run(key, month, code, expiresAt);

  return {
    status: 'sent',
    expiresAt,
    ttlSeconds: config.verify.codeTtlSeconds,
    remainingThisMonth: config.verify.monthlyLimit - used - 1,
    ...(config.demoMode ? { demoCode: code } : {}),
  };
}

function confirm({ country = '+82', phone, code }) {
  const input = String(code || '');
  if (config.testCodes.includes(input)) return { verified: true, test: true };

  const digits = validatePhone(country, phone);
  if (!digits) return { verified: false, reason: 'invalid', message: '휴대전화 번호 형식을 확인해 주세요.' };

  const row = db
    .prepare('SELECT * FROM verifications WHERE phone_key = ? ORDER BY id DESC LIMIT 1')
    .get(phoneKey(country, digits));

  if (!row) return { verified: false, reason: 'none', message: '먼저 인증번호를 받아 주세요.' };
  if (Date.now() > row.expires_at) {
    return { verified: false, reason: 'expired', message: '입력 시간이 지났어요.' };
  }
  if (row.code !== input) {
    return { verified: false, reason: 'mismatch', message: '인증번호가 맞지 않아요. 문자로 받은 6자리를 다시 확인해 주세요.' };
  }
  db.prepare('UPDATE verifications SET verified = 1 WHERE id = ?').run(row.id);
  return { verified: true };
}

module.exports = { send, confirm };
