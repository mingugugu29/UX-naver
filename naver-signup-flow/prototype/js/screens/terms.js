// 01 약관 동의: 필수/선택 분리, 안내문 접기, '보기'는 바텀시트
import { h } from '../dom.js';
import { allAgree, checkRow } from '../components/checks.js';
import { openSheet } from '../components/sheet.js';
import { TERMS, SHEET_NOTE } from './content.js';

const KEYS = ['required', 'location', 'privacy', 'ads'];

export default {
  id: 'terms',
  step: 1,
  title: '회원가입을 위해 약관에 동의해 주세요',

  render(ctx) {
    const t = ctx.state.terms;
    const rows = {};

    const all = allAgree({
      title: '전체 동의하기',
      desc: '필수 1개와 선택 항목(위치기반서비스, 개인정보 수집, 광고성 정보 수신)에 모두 동의해요.',
      onToggle: (on) => {
        KEYS.forEach((k) => { t[k] = on; });
        sync();
      },
    });

    function setTerm(key, on) {
      t[key] = on;
      if (key === 'privacy' && !on) t.ads = false; // 광고 수신은 개인정보 동의에 딸린 항목
      if (key === 'ads' && on) t.privacy = true;
      sync();
    }

    for (const key of KEYS) {
      const item = TERMS[key];
      rows[key] = checkRow({
        label: item.label,
        sub: item.sub,
        onToggle: (on) => setTerm(key, on),
        onView: item.sheet && (() => openSheet({
          ...item.sheet,
          note: SHEET_NOTE,
          actionLabel: '동의하고 닫기',
          onAction: () => setTerm(key, true),
        })),
      });
    }

    function sync(refresh = true) {
      all.set(KEYS.every((k) => t[k]));
      KEYS.forEach((k) => rows[k].set(t[k]));
      if (refresh) ctx.refresh();
    }
    sync(false);

    const body = [
      all.el,
      h('div', { class: 'group' }, h('p', { class: 'group-label' }, '필수'), rows.required.el),
      h('div', { class: 'group' }, h('p', { class: 'group-label' }, '선택'),
        rows.location.el, rows.privacy.el, rows.ads.el),
      h('details', { class: 'disclosure' },
        h('summary', {}, '개인정보 수집 및 이용 안내'),
        h('p', {}, '회원 식별과 본인 확인을 위해 이름, 생년월일, 성별, 휴대전화 번호를 받아요. 자세한 내용은 [선택] 개인정보 수집 및 이용의 "보기"에서 볼 수 있어요.')),
    ];

    return {
      body,
      primary: '다음',
      validate: () => ({ ok: t.required, hint: '필수 약관에 동의하면 다음으로 넘어갈 수 있어요' }),
      onNext: () => ctx.next('idType'),
    };
  },
};
