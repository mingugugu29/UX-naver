// 아이디 규칙과 중복 확인
const db = require('../db/database');
const config = require('../config');

const FORMAT = /^[a-z0-9_-]{5,20}$/;

function checkFormat(userId) {
  if (!userId) return '아이디를 입력해 주세요.';
  if (!FORMAT.test(userId)) return '5~20자의 영문 소문자, 숫자, 특수기호 _ - 만 쓸 수 있어요.';
  return null;
}

function isTaken(userId) {
  if (config.reservedIds.includes(userId)) return true;
  return Boolean(db.prepare('SELECT 1 FROM users WHERE user_id = ?').get(userId));
}

/** 비슷하지만 비어 있는 아이디를 하나 제안한다 */
function suggest(userId) {
  for (let i = 1; i < 100; i += 1) {
    const candidate = `${userId}_${String(i).padStart(2, '0')}`.slice(0, 20);
    if (!isTaken(candidate)) return candidate;
  }
  return null;
}

function check(userId) {
  const formatError = checkFormat(userId);
  if (formatError) return { available: false, reason: 'format', message: formatError };
  if (isTaken(userId)) {
    const s = suggest(userId);
    return {
      available: false,
      reason: 'taken',
      message: s ? `이미 사용 중인 아이디예요. 예) ${s}` : '이미 사용 중인 아이디예요.',
      suggestion: s,
    };
  }
  return { available: true, message: '사용할 수 있는 아이디예요' };
}

module.exports = { check, checkFormat, isTaken };
