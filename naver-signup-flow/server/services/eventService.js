// 사용성 측정 기록 저장
const db = require('../db/database');

const TYPES = ['session_start', 'screen_view', 'screen_leave', 'field_error', 'action_error', 'signup_complete'];
const VARIANTS = ['before', 'after'];
const MAX_BATCH = 50;

const insert = db.prepare(
  'INSERT INTO events (session_id, variant, type, screen, duration_ms, detail) VALUES (?, ?, ?, ?, ?, ?)',
);

const insertMany = db.transaction((rows) => rows.forEach((r) => insert.run(...r)));

function clean(event, sessionId, variant) {
  if (!event || !TYPES.includes(event.type)) return null;
  const duration = Number.isFinite(event.durationMs)
    ? Math.max(0, Math.min(Math.round(event.durationMs), 60 * 60 * 1000))
    : null;
  return [
    sessionId,
    variant,
    event.type,
    typeof event.screen === 'string' ? event.screen.slice(0, 32) : null,
    duration,
    typeof event.detail === 'string' ? event.detail.slice(0, 200) : null,
  ];
}

function record({ sessionId, variant = 'after', events }) {
  if (typeof sessionId !== 'string' || !/^[A-Za-z0-9-]{8,64}$/.test(sessionId)) {
    return { ok: false, message: 'sessionId가 올바르지 않아요.' };
  }
  const v = VARIANTS.includes(variant) ? variant : 'after';
  const rows = (Array.isArray(events) ? events : [])
    .slice(0, MAX_BATCH)
    .map((e) => clean(e, sessionId, v))
    .filter(Boolean);
  insertMany(rows);
  return { ok: true, saved: rows.length };
}

module.exports = { record };
