"use client";
export const dynamic = 'force-dynamic';

import React, { useMemo, useState } from "react";

// ------------------------------------------------------------
// Tango Puzzle Playground (single-file demo)
// - Default export is a ready-to-preview React component.
// - Includes a generator, live validators, and a simple UI.
// - No external deps beyond React + Tailwind in the host app.
// ------------------------------------------------------------

// ==== Types ====
export type Cell = 0 | 1;
export type MaybeCell = Cell | null;

export interface Constraint {
  a: [number, number]; // [row, col]
  b: [number, number]; // adjacent [row, col]
  type: "equal" | "opposite";
}

export interface TangoPuzzle {
  n: number;
  solution: Cell[][];
  givens: MaybeCell[][];
  constraints: Constraint[];
}

export interface GenerateOptions {
  n?: number; // even size, default 6
  maxBacktracks?: number; // safety cap
  constraintDensity?: number; // 0..1 probability per adjacent edge
  givenDensity?: number; // 0..1 probability to reveal a cell
  rng?: () => number; // custom RNG (e.g., seeded)
}

const SUN: Cell = 0;
const MOON: Cell = 1;

// ===================== GENERATOR =====================
function generateTangoPuzzle(opts: GenerateOptions = {}): TangoPuzzle {
  const n = opts.n ?? 6;
  if (n % 2 !== 0 || n <= 0) throw new Error("n must be a positive even number");
  const half = n / 2;
  const rng = opts.rng ?? Math.random;
  const maxBacktracks = opts.maxBacktracks ?? 200000;
  const constraintDensity = clamp(opts.constraintDensity ?? 0.1, 0, 1);
  const givenDensity = clamp(opts.givenDensity ?? 0.33, 0, 1);

  const grid: MaybeCell[][] = Array.from({ length: n }, () => Array(n).fill(null));
  const rowCount = Array.from({ length: n }, () => ({ sun: 0, moon: 0 }));
  const colCount = Array.from({ length: n }, () => ({ sun: 0, moon: 0 }));

  const violatesNoTriples = (r: number, c: number, val: Cell): boolean => {
    // Row checks
    if (c >= 2) {
      const a = grid[r][c - 1];
      const b = grid[r][c - 2];
      if (a !== null && b !== null && a === val && b === val) return true;
    }
    if (c + 2 < n) {
      const a = grid[r][c + 1];
      const b = grid[r][c + 2];
      if (a !== null && b !== null && a === val && b === val) return true;
    }
    if (c >= 1 && c + 1 < n) {
      const left = grid[r][c - 1];
      const right = grid[r][c + 1];
      if (left !== null && right !== null && left === val && right === val) return true;
    }

    // Column checks
    if (r >= 2) {
      const a = grid[r - 1][c];
      const b = grid[r - 2][c];
      if (a !== null && b !== null && a === val && b === val) return true;
    }
    if (r + 2 < n) {
      const a = grid[r + 1][c];
      const b = grid[r + 2][c];
      if (a !== null && b !== null && a === val && b === val) return true;
    }
    if (r >= 1 && r + 1 < n) {
      const up = grid[r - 1][c];
      const down = grid[r + 1][c];
      if (up !== null && down !== null && up === val && down === val) return true;
    }
    return false;
  };

  const violatesBalance = (r: number, c: number, val: Cell): boolean => {
    const half = n / 2;
    const rc = rowCount[r];
    const cc = colCount[c];
    if (val === SUN && rc.sun + 1 > half) return true;
    if (val === MOON && rc.moon + 1 > half) return true;
    if (val === SUN && cc.sun + 1 > half) return true;
    if (val === MOON && cc.moon + 1 > half) return true;

    const rowRemaining = n - (rc.sun + rc.moon + 1);
    if (val === SUN) {
      if (rc.moon > half) return true;
      if (rc.sun + 1 + rowRemaining < half) return true;
    } else {
      if (rc.sun > half) return true;
      if (rc.moon + 1 + rowRemaining < half) return true;
    }

    const colRemaining = n - (cc.sun + cc.moon + 1);
    if (val === SUN) {
      if (cc.moon > half) return true;
      if (cc.sun + 1 + colRemaining < half) return true;
    } else {
      if (cc.sun > half) return true;
      if (cc.moon + 1 + colRemaining < half) return true;
    }
    return false;
  };

  // Fill order heuristic
  const cells: Array<[number, number]> = [];
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) cells.push([r, c]);
  cells.sort((a, b) => {
    const ca = centerScore(a[0], a[1], n), cb = centerScore(b[0], b[1], n);
    if (ca !== cb) return ca - cb;
    return (a[0] + a[1]) % 2 - (b[0] + b[1]) % 2;
  });

  let backtracks = 0;
  const tryFill = (idx: number): boolean => {
    if (idx === cells.length) return true;
    if (backtracks > maxBacktracks) throw new Error("Backtrack limit hit");
    const [r, c] = cells[idx];

    const first = Math.random() < 0.5 ? SUN : MOON;
    const order: Cell[] = [first, (first ^ 1) as Cell];
    for (const val of order) {
      if (violatesNoTriples(r, c, val)) continue;
      if (violatesBalance(r, c, val)) continue;

      grid[r][c] = val;
      if (val === SUN) { rowCount[r].sun++; colCount[c].sun++; } else { rowCount[r].moon++; colCount[c].moon++; }

      if (tryFill(idx + 1)) return true;

      grid[r][c] = null;
      if (val === SUN) { rowCount[r].sun--; colCount[c].sun--; } else { rowCount[r].moon--; colCount[c].moon--; }
      backtracks++;
    }
    return false;
  };

  tryFill(0);
  const solution = grid.map(row => row.map(cell => (cell ?? SUN)) as Cell[]);

  // Constraints sampling
  const constraints: Constraint[] = [];
  const shouldPlace = () => rng() < constraintDensity;
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if (c + 1 < n && shouldPlace()) {
        constraints.push({
          a: [r, c],
          b: [r, c + 1],
          type: solution[r][c] === solution[r][c + 1] ? "equal" : "opposite",
        });
      }
      if (r + 1 < n && shouldPlace()) {
        constraints.push({
          a: [r, c],
          b: [r + 1, c],
          type: solution[r][c] === solution[r + 1][c] ? "equal" : "opposite",
        });
      }
    }
  }

  // Givens
  const givens: MaybeCell[][] = solution.map(row => row.map(cell => (rng() < givenDensity ? cell : null)));
  for (let r = 0; r < n; r++) {
    if (givens[r].every(v => v === null)) {
      const pick = Math.floor(rng() * n);
      givens[r][pick] = solution[r][pick];
    }
  }
  for (let c = 0; c < n; c++) {
    let has = false;
    for (let r = 0; r < n; r++) if (givens[r][c] !== null) { has = true; break; }
    if (!has) {
      const r = Math.floor(rng() * n);
      givens[r][c] = solution[r][c];
    }
  }

  return { n, solution, givens, constraints };
}

// ===================== VALIDATION HELPERS =====================
function clamp(x: number, lo: number, hi: number) { return Math.max(lo, Math.min(hi, x)); }
function centerScore(r: number, c: number, n: number) {
  const cr = Math.abs(r - (n - 1) / 2);
  const cc = Math.abs(c - (n - 1) / 2);
  return cr * cr + cc * cc;
}

function lineTriplesIndices(line: MaybeCell[]): number[] {
  // returns a set (as array) of indices that participate in any triple
  const n = line.length;
  const bad = new Set<number>();
  for (let i = 0; i < n; i++) {
    const v = line[i];
    if (v === null) continue;
    // v v v (i-2, i-1, i)
    if (i >= 2 && line[i - 1] === v && line[i - 2] === v) { bad.add(i); bad.add(i - 1); bad.add(i - 2); }
    // v v v (i, i+1, i+2)
    if (i + 2 < n && line[i + 1] === v && line[i + 2] === v) { bad.add(i); bad.add(i + 1); bad.add(i + 2); }
    // v sandwiched
    if (i >= 1 && i + 1 < n && line[i - 1] === v && line[i + 1] === v) { bad.add(i); bad.add(i - 1); bad.add(i + 1); }
  }
  const out: number[] = [];
  bad.forEach(v => out.push(v));
  return out;
}

function lineCounts(line: MaybeCell[]): { sun: number; moon: number } {
  let sun = 0, moon = 0;
  for (const v of line) {
    if (v === 0) sun++; else if (v === 1) moon++;
  }
  return { sun, moon };
}

function obeysConstraint(a: MaybeCell, b: MaybeCell, type: "equal" | "opposite"): boolean | null {
  if (a === null || b === null) return null; // undecided
  return type === "equal" ? a === b : a !== b;
}

// ================ UI COMPONENT =================

type Skin = "emoji" | "dots";

function CellView({ v, locked, onClick, onClear, bad, size }: {
  v: MaybeCell;
  locked?: boolean;
  onClick: () => void;
  onClear: (e: React.MouseEvent) => void;
  bad?: boolean;
  size: number;
}) {
  const base = "flex items-center justify-center select-none text-xl md:text-2xl rounded-xl border transition active:scale-95";
  const state = locked
    ? "bg-gray-100 text-gray-700 border-gray-300"
    : "bg-white hover:bg-gray-50 border-gray-200";
  const danger = bad ? "ring-2 ring-red-500" : "";

  return (
    <button
      className={`${base} ${state} ${danger}`}
      style={{ width: size, height: size }}
      onClick={onClick}
      onContextMenu={(e) => { e.preventDefault(); onClear(e); }}
      title={locked ? "Given" : "Click to toggle, right-click to clear"}
    >
      {v === null ? "" : v === 0 ? "☀️" : "🌑"}
    </button>
  );
}

function ConstraintOverlay({ n, constraints, statuses, cell, gap }: { n: number; constraints: Constraint[]; statuses: (boolean | null)[]; cell: number; gap: number }) {
  // Pixel-accurate overlay that draws crisp badges exactly BETWEEN cells.
  const CELL = cell; // px
  const GAP = gap;  // px
  const W = n * CELL + (n - 1) * GAP;
  const H = W;

  const items = constraints.map((k, i) => {
    const [ra, ca] = k.a; const [rb, cb] = k.b;
    const status = statuses[i];
    const color = status === null ? "bg-gray-200 text-gray-700 border-gray-300"
      : status ? "bg-emerald-100 text-emerald-700 border-emerald-300"
      : "bg-red-100 text-red-700 border-red-300";

    // Centers of the two cells
    const ax = ca * (CELL + GAP) + CELL / 2;
    const ay = ra * (CELL + GAP) + CELL / 2;
    const bx = cb * (CELL + GAP) + CELL / 2;
    const by = rb * (CELL + GAP) + CELL / 2;

    // Midpoint between the two centers
    const mx = (ax + bx) / 2;
    const my = (ay + by) / 2;

    const style: React.CSSProperties = {
      position: "absolute",
      left: mx,
      top: my,
      transform: "translate(-50%, -50%)",
      pointerEvents: "none",
    };

    return (
      <div key={i} style={style} className={`px-1.5 py-0.5 text-[10px] md:text-xs rounded-full border shadow-sm ${color}`}>
        {k.type === "equal" ? "=" : "×"}
      </div>
    );
  });

  return (
    <div style={{ position: "absolute", left: 0, top: 0, width: W, height: H, pointerEvents: "none" }} aria-hidden>
      {items}
    </div>
  );
}

export default function TangoPlayground() {
  const [n, setN] = useState(6);
  const [constraintDensity, setConstraintDensity] = useState(0.12);
  const [givenDensity, setGivenDensity] = useState(0.35);
  const [puzzle, setPuzzle] = useState<TangoPuzzle>(() => generateTangoPuzzle({ n, constraintDensity, givenDensity }));
  const [board, setBoard] = useState<MaybeCell[][]>(() => puzzle.givens.map(r => [...r]));
  const [showSolution, setShowSolution] = useState(false);

  // Derived validations
  const rowBad: Array<Set<number>> = useMemo(() => board.map(line => new Set(lineTriplesIndices(line))), [board]);
  const colBad: Array<Set<number>> = useMemo(() => {
    const out: Array<Set<number>> = [];
    for (let c = 0; c < puzzle.n; c++) {
      const col = board.map(r => r[c]);
      out.push(new Set(lineTriplesIndices(col)));
    }
    return out;
  }, [board, puzzle.n]);

  const rowCounts = useMemo(() => board.map(lineCounts), [board]);
  const colCounts = useMemo(() => {
    const arr: { sun: number; moon: number }[] = [];
    for (let c = 0; c < puzzle.n; c++) {
      const col = board.map(r => r[c]);
      arr.push(lineCounts(col));
    }
    return arr;
  }, [board, puzzle.n]);

  const half = puzzle.n / 2;

  const constraintStatuses = useMemo(() => {
    return puzzle.constraints.map((k) => {
      const a = board[k.a[0]][k.a[1]];
      const b = board[k.b[0]][k.b[1]];
      return obeysConstraint(a, b, k.type);
    });
  }, [board, puzzle.constraints]);

  const allFilled = useMemo(() => board.every(r => r.every(c => c !== null)), [board]);
  const hasTriples = useMemo(() => rowBad.some(s => s.size > 0) || colBad.some(s => s.size > 0), [rowBad, colBad]);
  const balanceOK = useMemo(() =>
    rowCounts.every(rc => rc.sun <= half && rc.moon <= half) &&
    colCounts.every(cc => cc.sun <= half && cc.moon <= half)
  , [rowCounts, colCounts, half]);
  const constraintsOK = useMemo(() => constraintStatuses.every(s => s !== false), [constraintStatuses]);

  const solved = useMemo(() => allFilled && !hasTriples && balanceOK && constraintsOK,
    [allFilled, hasTriples, balanceOK, constraintsOK]);

  function regen() {
    const p = generateTangoPuzzle({ n, constraintDensity, givenDensity });
    setPuzzle(p);
    setBoard(p.givens.map(r => [...r]));
    setShowSolution(false);
  }

  function clearBoard() {
    setBoard(puzzle.givens.map(r => [...r]));
  }

  function setCell(r: number, c: number, v: MaybeCell) {
    if (puzzle.givens[r][c] !== null) return; // lock givens
    setBoard(prev => prev.map((row, ri) => row.map((val, ci) => (ri === r && ci === c ? v : val))));
  }

  function toggleCell(r: number, c: number) {
    if (puzzle.givens[r][c] !== null) return;
    const cur = board[r][c];
    const next: MaybeCell = cur === null ? 0 : cur === 0 ? 1 : null;
    setCell(r, c, next);
  }

  // UI helpers
  const gridCols = `grid grid-cols-${Math.min(8, Math.max(2, n))}`; // tailwind needs safelist; we simulate with inline style below
  const CELL = 48; const GAP = 8;
  const gridStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: `repeat(${n}, ${CELL}px)`,
    gap: `${GAP}px`,
    position: "relative",
  };

  const violations: string[] = [];
  if (!balanceOK) violations.push("Row/column balance exceeded (max half of each symbol)");
  if (hasTriples) violations.push("No-triples rule violated somewhere");
  if (!constraintsOK) violations.push("A shown =/× constraint is violated");

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-bold mb-2">Tango Puzzle Playground</h1>
      <p className="text-gray-600 mb-4">Generate a random valid grid, view givens/constraints, and play. Click a cell to cycle (empty → ☀️ → 🌑 → empty). Right-click to clear. Givens are locked.</p>

      {/* Controls */}
      <div className="grid md:grid-cols-4 gap-3 mb-4">
        <div className="p-3 rounded-2xl border bg-white flex flex-col gap-2">
          <label className="text-sm text-gray-500">Board size (even)</label>
          <input type="number" min={2} step={2} value={n}
            className="px-3 py-2 rounded-xl border"
            onChange={(e) => setN(Math.max(2, Math.min(12, Number(e.target.value) || 6)))} />
          <label className="text-sm text-gray-500">Constraint density</label>
          <input type="range" min={0} max={1} step={0.01} value={constraintDensity}
            onChange={(e) => setConstraintDensity(Number(e.target.value))} />
          <div className="text-xs text-gray-500">{(constraintDensity * 100).toFixed(0)}%</div>
          <label className="text-sm text-gray-500">Given density</label>
          <input type="range" min={0} max={1} step={0.01} value={givenDensity}
            onChange={(e) => setGivenDensity(Number(e.target.value))} />
          <div className="text-xs text-gray-500">{(givenDensity * 100).toFixed(0)}%</div>
          <button onClick={regen} className="mt-2 px-4 py-2 rounded-xl bg-black text-white font-semibold">Generate</button>
        </div>

        <div className="p-3 rounded-2xl border bg-white flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Show solution</span>
            <input type="checkbox" checked={showSolution} onChange={(e) => setShowSolution(e.target.checked)} />
          </div>
          <button onClick={clearBoard} className="px-4 py-2 rounded-xl border font-medium">Reset to givens</button>
          <div className={`px-3 py-2 rounded-xl font-semibold ${solved ? "bg-green-100 text-green-700 border border-green-300" : "bg-gray-100 text-gray-700"}`}>
            {solved ? "Solved!" : "Keep going"}
          </div>
        </div>

        {/* Row counts */}
        <div className="p-3 rounded-2xl border bg-white">
          <div className="font-semibold mb-2">Row counts</div>
          <div className="flex flex-col gap-1 text-sm">
            {rowCounts.map((rc, r) => (
              <div key={r} className="flex items-center justify-between">
                <span className="text-gray-500">Row {r + 1}</span>
                <span className={`${rc.sun > half || rc.moon > half ? "text-red-600" : ""}`}>☀️ {rc.sun} / 🌑 {rc.moon}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Col counts */}
        <div className="p-3 rounded-2xl border bg-white">
          <div className="font-semibold mb-2">Column counts</div>
          <div className="flex flex-col gap-1 text-sm">
            {colCounts.map((cc, c) => (
              <div key={c} className="flex items-center justify-between">
                <span className="text-gray-500">Col {c + 1}</span>
                <span className={`${cc.sun > half || cc.moon > half ? "text-red-600" : ""}`}>☀️ {cc.sun} / 🌑 {cc.moon}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Board */}
      <div className="rounded-3xl border bg-white p-4">
        <div style={gridStyle}>
          {Array.from({ length: puzzle.n }).map((_, r) => (
            <React.Fragment key={r}>
              {Array.from({ length: puzzle.n }).map((_, c) => {
                const locked = puzzle.givens[r][c] !== null;
                const cur = showSolution ? puzzle.solution[r][c] : board[r][c];
                const bad = rowBad[r].has(c) || colBad[c].has(r);
                return (
                  <CellView
                    key={`${r}-${c}`}
                    v={cur}
                    locked={locked && !showSolution}
                    bad={bad && !showSolution}
                    size={CELL}
                    onClick={() => (showSolution ? undefined : toggleCell(r, c))}
                    onClear={() => (showSolution ? undefined : setCell(r, c, null))}
                  />
                );
              })}
            </React.Fragment>
          ))}

          {/* Edge constraint badges (clearer, centered chips) */}
          <ConstraintOverlay
              n={puzzle.n}
              constraints={puzzle.constraints}
              statuses={constraintStatuses}
              cell={CELL}
              gap={GAP}
          />
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-3 text-sm text-gray-600">
        <span className="px-3 py-1 rounded-full bg-gray-100">Click: toggle ☀️ → 🌑</span>
        <span className="px-3 py-1 rounded-full bg-gray-100">Right-click: clear</span>
        <span className="px-3 py-1 rounded-full bg-gray-100">Red ring = participates in a triple</span>
        <span className="px-3 py-1 rounded-full bg-gray-100">= means adjacent cells must match (chip between cells)</span>
        <span className="px-3 py-1 rounded-full bg-gray-100">× means adjacent cells must differ (chip between cells)</span>
      </div>
    </div>
  );
}

