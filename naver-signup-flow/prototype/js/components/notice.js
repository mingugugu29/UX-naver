// 안내 박스 (info · warn · error)
import { h, icon } from '../dom.js';

const ICON = { info: 'info', warn: 'warn', error: 'err' };

export function notice(tone, text) {
  return h('div', { class: `notice notice-${tone}`, role: tone === 'error' ? 'alert' : null },
    icon(ICON[tone]),
    h('p', {}, text));
}
