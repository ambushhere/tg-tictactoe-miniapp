// Логика крестиков-ноликов для Mini App. Игрок — X, бот — O.
const LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

function winner(b) {
  for (const [a, c, d] of LINES) {
    if (b[a] && b[a] === b[c] && b[a] === b[d]) return { who: b[a], line: [a, c, d] };
  }
  return null;
}

const freeCells = (b) => b.map((v, i) => (v ? -1 : i)).filter((i) => i >= 0);

// Минимакс: идеальный ход (бота нельзя обыграть).
function minimax(b, turn) {
  const w = winner(b);
  if (w) return { score: w.who === 'O' ? 10 : -10 };
  const free = freeCells(b);
  if (!free.length) return { score: 0 };
  let best = null;
  for (const i of free) {
    b[i] = turn;
    const r = minimax(b, turn === 'O' ? 'X' : 'O');
    b[i] = null;
    const s = r.score - Math.sign(r.score); // быстрее выиграть, дольше проигрывать
    if (!best || (turn === 'O' ? s > best.score : s < best.score)) best = { score: s, move: i };
  }
  return best;
}

// Уровни: шанс «зевнуть» и сходить случайно.
const MISTAKE = { easy: 0.6, normal: 0.25, hard: 0 };

function botMove(b, level = 'normal', rnd = Math.random) {
  const free = freeCells(b);
  if (!free.length) return -1;
  if (rnd() < (MISTAKE[level] ?? 0.25)) return free[Math.floor(rnd() * free.length)];
  return minimax(b.slice(), 'O').move;
}

if (typeof module !== 'undefined') module.exports = { winner, botMove, minimax, freeCells };
