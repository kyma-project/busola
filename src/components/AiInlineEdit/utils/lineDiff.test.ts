import { diffLines, buildDiffBlocks, hasChanges, splitLines } from './lineDiff';

describe('lineDiff', () => {
  describe('diffLines', () => {
    it('returns only equal ops for identical input', () => {
      const ops = diffLines('a\nb\nc', 'a\nb\nc');
      expect(ops.every((op) => op.type === 'equal')).toBe(true);
      expect(hasChanges(ops)).toBe(false);
    });

    it('detects a pure insertion', () => {
      const ops = diffLines('a\nc', 'a\nb\nc');
      expect(ops).toEqual([
        { type: 'equal', text: 'a' },
        { type: 'ins', text: 'b' },
        { type: 'equal', text: 'c' },
      ]);
      expect(hasChanges(ops)).toBe(true);
    });

    it('detects a pure deletion', () => {
      const ops = diffLines('a\nb\nc', 'a\nc');
      expect(ops).toEqual([
        { type: 'equal', text: 'a' },
        { type: 'del', text: 'b' },
        { type: 'equal', text: 'c' },
      ]);
    });

    it('detects a replacement as del-then-ins', () => {
      const ops = diffLines('a\nb\nc', 'a\nB\nc');
      expect(ops).toEqual([
        { type: 'equal', text: 'a' },
        { type: 'del', text: 'b' },
        { type: 'ins', text: 'B' },
        { type: 'equal', text: 'c' },
      ]);
    });
  });

  describe('buildDiffBlocks', () => {
    it('produces no blocks for identical input', () => {
      const blocks = buildDiffBlocks(diffLines('a\nb', 'a\nb'));
      expect(blocks).toEqual([]);
    });

    it('maps a replacement to a removed block followed by an added block', () => {
      // line 2 ("b") replaced with "B"
      const blocks = buildDiffBlocks(diffLines('a\nb\nc', 'a\nB\nc'));
      expect(blocks).toEqual([
        { kind: 'removed', startLine: 2, endLine: 2, lines: ['b'] },
        { kind: 'added', afterLine: 2, lines: ['B'] },
      ]);
    });

    it('places an insertion after the preceding original line', () => {
      const blocks = buildDiffBlocks(diffLines('a\nc', 'a\nb\nc'));
      expect(blocks).toEqual([{ kind: 'added', afterLine: 1, lines: ['b'] }]);
    });

    it('uses afterLine 0 for an insertion at the very top', () => {
      const blocks = buildDiffBlocks(diffLines('a\nb', 'x\na\nb'));
      expect(blocks).toEqual([{ kind: 'added', afterLine: 0, lines: ['x'] }]);
    });

    it('maps a pure deletion to a removed block with no added block', () => {
      const blocks = buildDiffBlocks(diffLines('a\nb\nc', 'a\nc'));
      expect(blocks).toEqual([
        { kind: 'removed', startLine: 2, endLine: 2, lines: ['b'] },
      ]);
    });

    it('handles multiple independent hunks', () => {
      const original = 'a\nb\nc\nd\ne';
      const updated = 'a\nB\nc\nd\nE';
      const blocks = buildDiffBlocks(diffLines(original, updated));
      expect(blocks).toEqual([
        { kind: 'removed', startLine: 2, endLine: 2, lines: ['b'] },
        { kind: 'added', afterLine: 2, lines: ['B'] },
        { kind: 'removed', startLine: 5, endLine: 5, lines: ['e'] },
        { kind: 'added', afterLine: 5, lines: ['E'] },
      ]);
    });

    it('handles a multi-line replacement block', () => {
      const original = 'top\nx1\nx2\nbottom';
      const updated = 'top\ny1\ny2\ny3\nbottom';
      const blocks = buildDiffBlocks(diffLines(original, updated));
      expect(blocks).toEqual([
        { kind: 'removed', startLine: 2, endLine: 3, lines: ['x1', 'x2'] },
        { kind: 'added', afterLine: 3, lines: ['y1', 'y2', 'y3'] },
      ]);
    });
  });

  describe('splitLines / trailing newline', () => {
    it('keeps a trailing empty line to mirror the Monaco line model', () => {
      expect(splitLines('a\nb\n')).toEqual(['a', 'b', '']);
    });

    it('does not report changes when only equal lines exist with trailing newline', () => {
      const ops = diffLines('a\nb\n', 'a\nb\n');
      expect(hasChanges(ops)).toBe(false);
    });
  });
});
