// 시작점
import { start, ctx } from './router.js';

start();

document.getElementById('restart').addEventListener('click', () => ctx.restart());
