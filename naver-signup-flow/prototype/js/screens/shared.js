// 정보 확인 화면에서 쓰는 '입력한 정보' 요약
import { summaryList } from '../components/summary.js';
import { idTypeLabel, genderLabel } from '../state.js';
import { formatBirth, displayPhone } from '../validators.js';

const FIELDS = {
  idType: ['아이디 유형', (s) => idTypeLabel[s.idType]],
  name: ['이름', (s) => s.name],
  birth: ['생년월일', (s) => formatBirth(s.birth)],
  gender: ['성별', (s) => genderLabel[s.gender]],
  phone: ['휴대전화 번호', (s) => displayPhone(s.phone, s.country.code)],
};

/** keys 순서대로 요약을 만들고, '수정'을 누르면 그 화면에 갔다가 돌아옴 */
export function fullInfo(ctx, keys) {
  return summaryList(keys.map((key) => {
    const [label, read] = FIELDS[key];
    return { label, value: read(ctx.state), onEdit: () => ctx.edit(key) };
  }));
}
