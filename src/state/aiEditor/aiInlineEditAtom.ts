import { atom } from 'jotai';

export type AiInlineEditStatus =
  | 'idle' // no widget open
  | 'prompting' // input shown, waiting for the user's query
  | 'loading' // request in flight
  | 'previewing' // suggestion rendered as an inline diff, awaiting accept/reject
  | 'error'; // last request failed; widget stays open for retry

export type AiInlineEditState = {
  status: AiInlineEditStatus;
  error: string | null;
};

export const DEFAULT_AI_INLINE_EDIT_STATE: AiInlineEditState = {
  status: 'idle',
  error: null,
};

// Lightweight, editor-agnostic status for the inline-edit flow. Per-editor
// specifics (pending YAML, computed diff blocks, decoration/zone ids) live in
// the useAiInlineEdit hook since they are tied to a single editor instance.
export const aiInlineEditAtom = atom<AiInlineEditState>(
  DEFAULT_AI_INLINE_EDIT_STATE,
);
aiInlineEditAtom.debugLabel = 'aiInlineEditAtom';
