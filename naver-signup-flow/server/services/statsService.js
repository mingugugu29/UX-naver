// 측정 결과 계산: 완료율, 소요 시간, 화면별 시간, 오류, 이탈 지점
const db = require('../db/database');

const median = (values) => {
  if (!values.length) return null;
  const s = [...values].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : Math.round((s[mid - 1] + s[mid]) / 2);
};

const avg = (values) => (values.length ? Math.round(values.reduce((a, b) => a + b, 0) / values.length) : null);

function summarize(variant) {
  const sessions = db
    .prepare("SELECT DISTINCT session_id FROM events WHERE variant = ? AND type = 'session_start'")
    .all(variant)
    .map((r) => r.session_id);

  const completed = db
    .prepare("SELECT session_id, duration_ms FROM events WHERE variant = ? AND type = 'signup_complete'")
    .all(variant);
  const completedIds = new Set(completed.map((r) => r.session_id));
  const totals = completed.map((r) => r.duration_ms).filter((n) => n != null);

  // 화면별 머문 시간 (같은 세션에서 여러 번 들어간 화면은 합산)
  const leaves = db
    .prepare(
      `SELECT screen, session_id, SUM(duration_ms) AS ms FROM events
       WHERE variant = ? AND type = 'screen_leave' AND screen IS NOT NULL
       GROUP BY screen, session_id`,
    )
    .all(variant);
  const byScreen = {};
  leaves.forEach((r) => (byScreen[r.screen] ??= []).push(r.ms));

  const errors = db
    .prepare(
      `SELECT screen, detail, COUNT(*) AS n FROM events
       WHERE variant = ? AND type IN ('field_error', 'action_error')
       GROUP BY screen, detail ORDER BY n DESC LIMIT 20`,
    )
    .all(variant);

  // 끝내지 못한 세션이 마지막으로 본 화면 = 이탈 지점
  const lastViews = db
    .prepare(
      `SELECT e.session_id, e.screen FROM events e
       JOIN (SELECT session_id, MAX(id) AS id FROM events
             WHERE variant = ? AND type = 'screen_view' GROUP BY session_id) last
         ON last.id = e.id`,
    )
    .all(variant);
  const dropOff = {};
  lastViews
    .filter((r) => !completedIds.has(r.session_id))
    .forEach((r) => { dropOff[r.screen] = (dropOff[r.screen] || 0) + 1; });

  return {
    variant,
    sessions: sessions.length,
    completed: completedIds.size,
    completionRate: sessions.length ? Math.round((completedIds.size / sessions.length) * 1000) / 10 : null,
    totalMs: { median: median(totals), average: avg(totals) },
    screens: Object.entries(byScreen).map(([screen, values]) => ({
      screen,
      sessions: values.length,
      medianMs: median(values),
      averageMs: avg(values),
    })),
    errors: errors.map((r) => ({ screen: r.screen, message: r.detail, count: r.n })),
    dropOff: Object.entries(dropOff)
      .map(([screen, count]) => ({ screen, count }))
      .sort((a, b) => b.count - a.count),
  };
}

function overview() {
  const users = db.prepare('SELECT id_type, COUNT(*) AS n FROM users GROUP BY id_type').all();
  return {
    generatedAt: new Date().toISOString(),
    signups: Object.fromEntries(users.map((r) => [r.id_type, r.n])),
    variants: {
      after: summarize('after'),
      before: summarize('before'),
    },
  };
}

module.exports = { overview };
