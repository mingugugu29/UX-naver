// 가입 저장 (식별 정보는 저장하지 않는다)
const db = require('../db/database');
const ids = require('./idService');

const ID_TYPES = ['real', 'basic'];
const GENDERS = ['male', 'female', 'none'];

function create({ userId, idType, gender, country, sessionId }) {
  const check = ids.check(userId);
  if (!check.available) return { ok: false, status: 409, ...check };
  if (!ID_TYPES.includes(idType)) return { ok: false, status: 400, message: '아이디 유형을 확인해 주세요.' };

  db.prepare(
    'INSERT INTO users (user_id, id_type, gender, country, session_id) VALUES (?, ?, ?, ?, ?)',
  ).run(
    userId,
    idType,
    GENDERS.includes(gender) ? gender : null,
    typeof country === 'string' ? country.slice(0, 8) : null,
    typeof sessionId === 'string' ? sessionId.slice(0, 64) : null,
  );
  return { ok: true, userId };
}

module.exports = { create };
