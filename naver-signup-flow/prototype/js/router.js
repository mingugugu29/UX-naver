// 화면 전환, 뒤로가기, 하단 버튼 상태 관리
import { h, icon } from './dom.js';
import { state, resetState } from './state.js';
import { progress } from './components/progress.js';
import { screens } from './screens/index.js';
import { startSession, enterScreen } from './analytics.js';

const app = document.getElementById('app');
const history = [];
let current = null;
let view = null;
let foot = null;
let busy = false; // 서버 응답을 기다리는 중 (버튼 두 번 누름 방지)

/** 하단 버튼: 서버를 부르는 화면이면 응답이 올 때까지 버튼을 잠근다 */
async function runNext() {
  if (!foot || foot.primary.disabled || busy) return;
  const result = view.onNext();
  if (!result || typeof result.then !== 'function') return;
  busy = true;
  foot.primary.disabled = true;
  foot.primary.setAttribute('aria-busy', 'true');
  try {
    await result;
  } finally {
    busy = false;
    foot?.primary.removeAttribute('aria-busy');
    ctx.refresh();
  }
}

export const ctx = {
  state,
  /** 다른 화면으로 이동 */
  go(id) {
    if (current) history.push(current.id);
    render(id);
  },
  /** 다음 화면으로 이동. '수정'으로 들어온 경우엔 원래 화면으로 돌아감 */
  next(id) {
    if (state.returnTo) {
      const target = state.returnTo;
      state.returnTo = null;
      ctx.go(target);
    } else {
      ctx.go(id);
    }
  },
  /** 이전 입력값 '수정' */
  edit(id) {
    state.returnTo = current.id;
    ctx.go(id);
  },
  back() {
    const prev = history.pop();
    if (!prev) return;
    state.returnTo = null;
    render(prev);
  },
  /** 입력이 바뀌면 하단 버튼과 안내 문구를 다시 계산 */
  refresh() {
    if (!foot || busy) return;
    const result = view.validate ? view.validate() : { ok: true };
    foot.primary.disabled = !result.ok;
    foot.hint.textContent = result.ok ? '' : result.hint || '';
    foot.hint.hidden = !foot.hint.textContent;
  },
  restart() {
    resetState();
    history.length = 0;
    current = null;
    startSession();
    render(screens.order[0]);
  },
};

function render(id) {
  view?.cleanup?.();
  foot = null;

  const screen = screens.byId[id];
  current = screen;
  enterScreen(id);
  view = screen.render(ctx);

  const showBack = !screen.noBack && history.length > 0;
  const head = showBack || screen.step
    ? h('div', { class: 'card-head' },
        showBack && h('button', { type: 'button', class: 'icon-btn back', 'aria-label': '이전 단계로', onclick: ctx.back }, icon('back')),
        screen.step && progress(screen.step))
    : null;

  const title = h('h1', { tabIndex: -1 }, view.title ?? screen.title);
  const hint = h('p', { class: 'hint', hidden: true });
  const primary = h('button', { type: 'button', class: 'btn btn-primary', onclick: runNext }, view.primary);
  const secondary = view.secondary &&
    h('button', { type: 'button', class: 'btn btn-secondary', onclick: view.secondary.onClick }, view.secondary.label);

  app.className = `card${view.center ? ' center' : ''}`;
  app.replaceChildren(...[
    head,
    h('div', { class: 'card-title' }, title, view.sub && h('p', {}, view.sub)),
    h('div', { class: 'card-body' }, view.body),
    h('div', { class: 'card-foot' }, hint, primary, secondary),
  ].filter(Boolean));

  foot = { hint, primary };
  ctx.refresh();

  window.scrollTo({ top: 0 });
  title.focus({ preventScroll: true });
}

// 입력창에서 Enter를 누르면 다음으로
app.addEventListener('keydown', (e) => {
  if (e.key !== 'Enter' || e.target.tagName !== 'INPUT' || e.isComposing) return;
  if (foot && !foot.primary.disabled) {
    e.preventDefault();
    runNext();
  }
});

export function start() {
  startSession();
  render(screens.order[0]);
}
