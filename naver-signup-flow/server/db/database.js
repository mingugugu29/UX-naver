// SQLite 연결과 테이블 만들기
const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');
const config = require('../config');

fs.mkdirSync(path.dirname(config.dbPath), { recursive: true });

const db = new Database(config.dbPath);
db.pragma('journal_mode = WAL');

db.exec(`
  -- 가입한 계정 (실습용: 이름·생년월일·전화번호·비밀번호는 저장하지 않는다)
  CREATE TABLE IF NOT EXISTS users (
    user_id     TEXT PRIMARY KEY,
    id_type     TEXT NOT NULL,
    gender      TEXT,
    country     TEXT,
    session_id  TEXT,
    created_at  TEXT NOT NULL DEFAULT (datetime('now'))
  );

  -- 인증번호 발송 기록 (월 1회 제한, 3분 만료 검사에 쓴다)
  CREATE TABLE IF NOT EXISTS verifications (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    phone_key   TEXT NOT NULL,
    month_key   TEXT NOT NULL,
    code        TEXT NOT NULL,
    expires_at  INTEGER NOT NULL,
    verified    INTEGER NOT NULL DEFAULT 0,
    created_at  TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE INDEX IF NOT EXISTS idx_verif_phone_month ON verifications (phone_key, month_key);

  -- 사용성 측정: 화면 진입·이탈·오류·완료 기록
  CREATE TABLE IF NOT EXISTS events (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id  TEXT NOT NULL,
    variant     TEXT NOT NULL DEFAULT 'after',
    type        TEXT NOT NULL,
    screen      TEXT,
    duration_ms INTEGER,
    detail      TEXT,
    created_at  TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE INDEX IF NOT EXISTS idx_events_session ON events (session_id);
`);

module.exports = db;
