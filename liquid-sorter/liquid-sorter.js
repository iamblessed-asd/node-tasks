function cloneState(state) {
  return state.map(t => t.slice());
}

//ключ для матрицы: '|' - для разделения пробирок, ',' - для разделения значений  , '.' - для пустых ячеек
function stateKey(state) {
  return state.map(t => t.map(c => (c === null ? '.' : String(c))).join(',')).join('|');
}

// проверка на то, что все пробирки имеют только один цвет
function isSolved(state) {
  const seen = new Map();
  for (let i = 0; i < state.length; i++) {
    const tube = state[i];
    const cells = tube.filter(x => x !== null);

    if (cells.length === 0) continue;

    const first = cells[0];

    if (!cells.every(c => c === first)) return false;

    if (seen.has(first)) {
      return false;
    }
    seen.set(first, i);
  }
  return true;
}

// Возвращает цвет и его количество ячеек сверху пробирки, если пусто, то null
function topColorAndCount(tube) {
  const cells = tube;
  let i = 0;
  while (i < cells.length && cells[i] === null) i++;
  if (i === cells.length) return { color: null, count: 0, topIndex: -1 };
  const color = cells[i];
  let j = i + 1;
  while (j < cells.length && cells[j] === color) j++;
  return { color, count: j - i, topIndex: i };
}

//Считает количество свободных ячеек сверху пробирки
function spaceAtTop(tube) {
  let cnt = 0;
  for (let i = 0; i < tube.length; i++) {
    if (tube[i] === null) cnt++; else break;
  }
  return cnt;
}

//Возвращает новое состояние матрицы
function applyMove(state, from, to) {
  const s = cloneState(state);
  const src = s[from];
  const dst = s[to];

  const { color, count, topIndex } = topColorAndCount(src);
  if (color === null) throw new Error('Неправильный ход - начальная пробирка пустая');
  const space = spaceAtTop(dst);
  if (space === 0) throw new Error('Неправильный ход - пробирка заполнена');
  const dstTop = topColorAndCount(dst);
  if (dstTop.color !== null && dstTop.color !== color) throw new Error('Неправильный ход - не совпадают цвета');

  const moveCount = Math.min(count, space);

  for (let k = 0; k < moveCount; k++) {
    src[topIndex + k] = null;
  }

  let di = 0;
  while (di < dst.length && dst[di] !== null) di++;
  for (let k = 0; k < moveCount; k++) {
    dst[di + k] = color;
  }
  return s;
}

function generateMoves(state) {
  const N = state.length;
  const moves = [];
  for (let i = 0; i < N; i++) {
    const { color: sc } = topColorAndCount(state[i]);
    if (sc === null) continue;
    for (let j = 0; j < N; j++) {
      if (i === j) continue;
      const { color: dc } = topColorAndCount(state[j]);
      if (spaceAtTop(state[j]) === 0) continue;
      if (dc !== null && dc !== sc) continue;
      moves.push([i, j]);
    }
  }
  return moves;
}

//Предпочтительно переливает в пробирки с одинаковыми цветами и максимальное кол-во ячеек
function scoreMove(state, move) {
  const [i, j] = move;
  const { color: sc, count } = topColorAndCount(state[i]);
  const space = spaceAtTop(state[j]);
  const pours = Math.min(count, space);
  const { color: dc } = topColorAndCount(state[j]);
  let score = pours;
  if (dc === sc && dc !== null) score += 10;
  if (dc === null && pours === count) score += 3;
  return -score;
}

// -------------------------- Solver --------------------------

function iterativeDeepeningSolve(initialState, maxDepth = 1000, maxNodes = 200000) {
  if (isSolved(initialState)) return [];
  for (let depth = 1; depth <= maxDepth; depth++) {
    const result = dfsLimited(initialState, depth, maxNodes);
    if (result) return result;
  }
  return null;
}

function dfsLimited(initialState, limitDepth, maxNodes) {
  const visited = new Set();
  let nodes = 0;

  function dfs(state, depth, path, lastMove) {
    nodes++;
    if (nodes > maxNodes) return null;
    const key = stateKey(state);
    if (visited.has(key) && visited.get) {}
    if (isSolved(state)) return path.slice();
    if (depth === limitDepth) return null;

    const moves = generateMoves(state);
    moves.sort((a, b) => scoreMove(state, a) - scoreMove(state, b));

    for (const mv of moves) {
      const [from, to] = mv;
      if (lastMove && lastMove[0] === to && lastMove[1] === from) continue;

      const next = applyMove(state, from, to);
      const k = stateKey(next);
      if (visited.has(k)) continue;

      visited.add(k);
      path.push([from, to]);
      const res = dfs(next, depth + 1, path, mv);
      if (res) return res;
      path.pop();
      visited.delete(k);
    }
    return null;
  }

  visited.add(stateKey(initialState));
  return dfs(initialState, 0, [], null);
}

// Разворачивание матрицы и её печать
function printState(state) {
  const N = state.length;
  const V = state[0].length;

  console.log('Состояние:');

  for (let level = 0; level < V; level++) {
    let row = '';
    for (let tube = 0; tube < N; tube++) {
      const cell = state[tube][level];
      row += (cell === null ? '.' : cell) + ' ';
    }
    console.log(row.trim());
  }

  console.log([...Array(N).keys()].join(' '));
}

function runExample(INPUT, options = {}) {
  const V = INPUT[0].length;
  const N = INPUT.length;
  
  for (let i = 0; i < N; i++) {
    if (INPUT[i].length !== V) throw new Error('У каждой пробирки должна быть длина V');
  }

  console.log(`N=${N}, V=${V}`);
  printState(INPUT);
  const start = Date.now();
  const moves = iterativeDeepeningSolve(INPUT, options.maxDepth || 100, options.maxNodes || 200000);
  const dur = (Date.now() - start) / 1000;
  if (!moves) {
    console.log('Решение не было найдено');
    return;
  }
  console.log(`Найдено решение в ${moves.length} шагов за ${dur.toFixed(2)} секунд:`);
  console.log(moves.map(m => `(${m[0]}, ${m[1]})`).join(' '));

  let s = cloneState(INPUT);
  for (const [f, t] of moves) {
    s = applyMove(s, f, t);
  }
  console.log('\nФинальное состояние:');
  printState(s);
}

// Входные тестовые данные, для пустых ячеек - null
const INPUT = [
  ['A','B','B','C'],
  ['C','A','A','B'],
  ['B','C','C','A'],
  [null,null,null,null],
  [null,null,null,null]
];

runExample(INPUT, { maxDepth: 100, maxNodes: 200000 });
