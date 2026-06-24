/**
 * Pure, dependency-free line-level diff used to render the AI suggestion as an
 * inline red/green preview in the Monaco editor.
 *
 * `diffLines` produces an ordered list of line operations via a classic LCS
 * walk; `buildDiffBlocks` coalesces those ops into render-ready blocks carrying
 * 1-based line numbers (so they map directly onto Monaco decorations and view
 * zones). Everything here is deterministic and trivially unit-testable.
 */

export type DiffOp =
  | { type: 'equal'; text: string }
  | { type: 'del'; text: string }
  | { type: 'ins'; text: string };

export type DiffBlock =
  // original lines to mark red (1-based, inclusive)
  | { kind: 'removed'; startLine: number; endLine: number; lines: string[] }
  // new lines to render green in a view zone placed after `afterLine`
  // (`afterLine === 0` means "before the first line")
  | { kind: 'added'; afterLine: number; lines: string[] };

export function splitLines(text: string): string[] {
  // Split on '\n' only; a trailing newline yields a trailing '' entry, which
  // matches Monaco's line model (e.g. "a\nb\n" -> 3 lines, the last empty).
  return text.split('\n');
}

export function diffLines(original: string, updated: string): DiffOp[] {
  const a = splitLines(original);
  const b = splitLines(updated);
  const n = a.length;
  const m = b.length;

  // dp[i][j] = length of the LCS of a[i..] and b[j..]
  const dp: number[][] = Array.from({ length: n + 1 }, () =>
    new Array(m + 1).fill(0),
  );
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      dp[i][j] =
        a[i] === b[j]
          ? dp[i + 1][j + 1] + 1
          : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }

  const ops: DiffOp[] = [];
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (a[i] === b[j]) {
      ops.push({ type: 'equal', text: a[i] });
      i++;
      j++;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      // prefer deletions first so a replacement renders as red-then-green
      ops.push({ type: 'del', text: a[i] });
      i++;
    } else {
      ops.push({ type: 'ins', text: b[j] });
      j++;
    }
  }
  while (i < n) ops.push({ type: 'del', text: a[i++] });
  while (j < m) ops.push({ type: 'ins', text: b[j++] });
  return ops;
}

export function hasChanges(ops: DiffOp[]): boolean {
  return ops.some((op) => op.type !== 'equal');
}

export function buildDiffBlocks(ops: DiffOp[]): DiffBlock[] {
  const blocks: DiffBlock[] = [];
  let origLine = 0; // last consumed original line number (1-based)
  let idx = 0;

  while (idx < ops.length) {
    const op = ops[idx];

    if (op.type === 'equal') {
      origLine++;
      idx++;
      continue;
    }

    if (op.type === 'del') {
      const startLine = origLine + 1;
      const lines: string[] = [];
      while (idx < ops.length && ops[idx].type === 'del') {
        lines.push(ops[idx].text);
        origLine++;
        idx++;
      }
      blocks.push({ kind: 'removed', startLine, endLine: origLine, lines });
      continue;
    }

    // op.type === 'ins'
    const afterLine = origLine;
    const lines: string[] = [];
    while (idx < ops.length && ops[idx].type === 'ins') {
      lines.push(ops[idx].text);
      idx++;
    }
    blocks.push({ kind: 'added', afterLine, lines });
  }

  return blocks;
}
