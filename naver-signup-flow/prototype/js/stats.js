// 측정 결과 페이지: /api/stats를 받아 표와 막대로 보여준다
import { h } from './dom.js';
import { screens } from './screens/index.js';

const SCREEN_NAMES = {
  terms: '약관 동의',
  idType: '아이디 유형',
  name: '이름',
  birth: '생년월일',
  gender: '성별',
  phone: '휴대폰 번호',
  verify: '인증번호',
  confirm: '정보 확인',
  userId: '아이디',
  password: '비밀번호',
  passkey: '패스키 안내',
  done: '가입 완료',
};
const nameOf = (id) => SCREEN_NAMES[id] || id || '알 수 없음';

function formatMs(ms) {
  if (ms == null) return '—';
  const sec = ms / 1000;
  if (sec < 60) return `${sec.toFixed(1)}초`;
  const m = Math.floor(sec / 60);
  return `${m}분 ${String(Math.round(sec % 60)).padStart(2, '0')}초`;
}

const tile = (label, value, note) =>
  h('div', { class: 'tile' },
    h('span', { class: 'tile-label' }, label),
    h('strong', { class: 'tile-value' }, value),
    note && h('span', { class: 'tile-note' }, note));

const section = (title, desc, ...children) =>
  h('section', { class: 'block' },
    h('h2', {}, title),
    desc && h('p', { class: 'block-desc' }, desc),
    ...children);

const empty = (text) => h('p', { class: 'muted' }, text);

function summary(v) {
  return h('div', { class: 'tiles' },
    tile('체험 시작', `${v.sessions}명`),
    tile('가입 완료', `${v.completed}명`),
    tile('완료율', v.completionRate == null ? '—' : `${v.completionRate}%`),
    tile('완료까지 걸린 시간', formatMs(v.totalMs.median), `중앙값 · 평균 ${formatMs(v.totalMs.average)}`));
}

function screenBars(v) {
  if (!v.screens.length) return empty('아직 기록이 없어요.');
  const order = screens.order;
  const rows = [...v.screens]
    .filter((r) => r.screen !== 'done')
    .sort((a, b) => order.indexOf(a.screen) - order.indexOf(b.screen));
  const max = Math.max(...rows.map((r) => r.medianMs || 0), 1);
  const slowest = rows.reduce((a, b) => ((b.medianMs || 0) > (a.medianMs || 0) ? b : a), rows[0]);
  return h('ul', { class: 'bars' },
    rows.map((r) => h('li', { class: `bar-row${r === slowest ? ' slowest' : ''}` },
      h('span', { class: 'bar-label' }, nameOf(r.screen)),
      h('span', { class: 'bar-track' },
        h('span', { class: 'bar-fill', style: `width:${Math.max(2, ((r.medianMs || 0) / max) * 100)}%` })),
      h('span', { class: 'bar-value' }, formatMs(r.medianMs), r === slowest ? ' · 가장 오래 걸림' : ''))));
}

function errorTable(v) {
  if (!v.errors.length) return empty('아직 오류 기록이 없어요.');
  return h('div', { class: 'table-wrap' },
    h('table', {},
      h('thead', {}, h('tr', {}, h('th', {}, '화면'), h('th', {}, '오류 내용'), h('th', { class: 'num' }, '횟수'))),
      h('tbody', {}, v.errors.map((e) =>
        h('tr', {}, h('td', {}, nameOf(e.screen)), h('td', {}, e.message), h('td', { class: 'num' }, e.count))))));
}

function dropOffList(v) {
  if (!v.dropOff.length) return empty('가입을 끝내지 않고 멈춘 기록이 없어요.');
  return h('ul', { class: 'chips' },
    v.dropOff.map((d) => h('li', {}, `${nameOf(d.screen)} `, h('b', {}, `${d.count}명`))));
}

function idTypeShare(signups) {
  const real = signups.real || 0;
  const basic = signups.basic || 0;
  const total = real + basic;
  if (!total) return empty('아직 가입 기록이 없어요.');
  const pct = (n) => Math.round((n / total) * 100);
  return h('div', { class: 'share' },
    h('div', { class: 'share-bar', role: 'img', 'aria-label': `실명 인증 ${pct(real)}%, 일반 ${pct(basic)}%` },
      h('span', { class: 'share-real', style: `width:${pct(real)}%` }),
      h('span', { class: 'share-basic', style: `width:${pct(basic)}%` })),
    h('p', { class: 'share-legend' },
      h('span', { class: 'dot real' }), `실명 인증 아이디 ${real}명 (${pct(real)}%)`,
      h('span', { class: 'dot basic' }), `일반 아이디 ${basic}명 (${pct(basic)}%)`));
}

function compare(before, after) {
  if (!before.sessions) {
    return empty('개선 전 흐름 기록이 아직 없어요. 개선 전 흐름을 재현한 화면이 기록을 "before"로 보내면 여기에 나란히 비교돼요.');
  }
  const row = (label, b, a) => h('tr', {}, h('td', {}, label), h('td', { class: 'num' }, b), h('td', { class: 'num' }, a));
  return h('div', { class: 'table-wrap' },
    h('table', {},
      h('thead', {}, h('tr', {}, h('th', {}, ''), h('th', { class: 'num' }, '개선 전'), h('th', { class: 'num' }, '개선 후'))),
      h('tbody', {},
        row('체험 수', `${before.sessions}명`, `${after.sessions}명`),
        row('완료율', `${before.completionRate ?? '—'}%`, `${after.completionRate ?? '—'}%`),
        row('완료까지 시간 (중앙값)', formatMs(before.totalMs.median), formatMs(after.totalMs.median)),
        row('오류 수', before.errors.reduce((n, e) => n + e.count, 0), after.errors.reduce((n, e) => n + e.count, 0)))));
}

async function load() {
  const root = document.getElementById('stats');
  let data = null;
  try {
    const res = await fetch('/api/stats');
    if ((res.headers.get('content-type') || '').includes('application/json')) data = await res.json();
  } catch (e) {
    data = null;
  }
  if (!data) {
    root.replaceChildren(empty('서버에 연결해야 측정 결과를 볼 수 있어요. 서버를 켠 주소(예: http://localhost:3000/stats)로 열어 주세요.'));
    return;
  }

  const after = data.variants.after;
  document.getElementById('updated').textContent =
    `${new Date(data.generatedAt).toLocaleString('ko-KR')} 기준`;

  root.replaceChildren(
    summary(after),
    after.sessions && after.sessions < 5
      ? h('p', { class: 'caution' }, `아직 ${after.sessions}명의 기록이라 결과가 크게 흔들릴 수 있어요.`)
      : null,
    section('화면별 머문 시간', '한 사람이 그 화면에 머문 시간의 중앙값이에요. 오래 걸리는 화면이 먼저 고칠 곳이에요.', screenBars(after)),
    section('오류가 난 곳', '빨간 안내가 뜬 칸과 서버가 거절한 동작이에요.', errorTable(after)),
    section('멈춘 곳', '가입을 끝내지 않은 사람이 마지막으로 본 화면이에요.', dropOffList(after)),
    section('아이디 유형 선택', '차이를 설명한 카드에서 어떤 아이디를 골랐는지 보여줘요.', idTypeShare(data.signups)),
    section('개선 전과 비교', null, compare(data.variants.before, after)),
  );
}

document.getElementById('reload').addEventListener('click', load);
load();
