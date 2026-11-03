// 화면 목록 (순서 = 기본 가입 흐름)
import terms from './terms.js';
import idType from './idType.js';
import name from './name.js';
import birth from './birth.js';
import gender from './gender.js';
import phone from './phone.js';
import verify from './verify.js';
import confirm from './confirm.js';
import userId from './userId.js';
import password from './password.js';
import passkey from './passkey.js';
import done from './done.js';

const list = [terms, idType, name, birth, gender, phone, verify, confirm, userId, password, passkey, done];

export const screens = {
  order: list.map((s) => s.id),
  byId: Object.fromEntries(list.map((s) => [s.id, s])),
};
