import { ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { useSetAtom } from 'jotai';
import jsyaml from 'js-yaml';
import { editor as monacoEditor, KeyCode, KeyMod, Range } from 'monaco-editor';

import {
  aiInlineEditAtom,
  AiInlineEditStatus,
  DEFAULT_AI_INLINE_EDIT_STATE,
} from 'state/aiEditor/aiInlineEditAtom';
import { suggestEdits } from 'components/AiInlineEdit/api/suggestEdits';
import {
  buildDiffBlocks,
  diffLines,
  hasChanges,
} from 'components/AiInlineEdit/utils/lineDiff';
import { PromptWidget } from 'components/AiInlineEdit/components/PromptWidget';
import 'components/AiInlineEdit/AiInlineEdit.scss';

const ACTION_ID = 'ai-inline-edit.start';
const WIDGET_ID = 'ai-inline-edit.prompt-widget';

type Editor = monacoEditor.IStandaloneCodeEditor;

type UseAiInlineEditParams = {
  editorInstance: Editor | null;
  readOnly?: boolean;
};

export function useAiInlineEdit({
  editorInstance,
  readOnly = false,
}: UseAiInlineEditParams): { widget: ReactNode } {
  const { t } = useTranslation();
  const setAtom = useSetAtom(aiInlineEditAtom);

  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<AiInlineEditStatus>('idle');
  const [query, setQuery] = useState('');
  const [error, setError] = useState<string | null>(null);
  // Live 1-based line range the prompt refers to. Mirrors the editor selection
  // in realtime while the popover is open (label + submitted range).
  const [selection, setSelection] = useState<{ start: number; end: number }>({
    start: 1,
    end: 1,
  });

  // Imperative state tied to the single editor instance.
  // Stable DOM node shared by the Monaco content widget and the React portal.
  const [contentNode] = useState(() => document.createElement('div'));
  const widgetRef = useRef<monacoEditor.IContentWidget | null>(null);
  const positionRef = useRef({ lineNumber: 1, column: 1 });
  const decorationsRef =
    useRef<monacoEditor.IEditorDecorationsCollection | null>(null);
  const zoneIdsRef = useRef<string[]>([]);
  const pendingYamlRef = useRef<string | null>(null);
  const originalReadOnlyRef = useRef(false);
  const lockedRef = useRef(false);
  const isOpenRef = useRef(false);
  const abortRef = useRef<AbortController | null>(null);
  // Spacer view zone that reserves vertical space for the prompt widget so it
  // pushes the code down instead of overlapping it.
  const promptZoneIdRef = useRef<string | null>(null);
  const promptZoneRef = useRef<monacoEditor.IViewZone | null>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const queryRef = useRef('');
  useEffect(() => {
    queryRef.current = query;
  }, [query]);
  const statusRef = useRef(status);
  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  // Keep the global status atom in sync (used by the toolbar / external reads).
  useEffect(() => {
    setAtom({ status, error });
  }, [status, error, setAtom]);

  const getWidget = useCallback((): monacoEditor.IContentWidget => {
    if (!widgetRef.current) {
      widgetRef.current = {
        getId: () => WIDGET_ID,
        getDomNode: () => contentNode,
        getPosition: () => ({
          position: positionRef.current,
          preference: [
            monacoEditor.ContentWidgetPositionPreference.BELOW,
            monacoEditor.ContentWidgetPositionPreference.ABOVE,
          ],
        }),
      };
    }
    return widgetRef.current;
  }, [contentNode]);

  const clearPreview = useCallback((editor: Editor) => {
    decorationsRef.current?.clear();
    decorationsRef.current = null;
    if (zoneIdsRef.current.length) {
      editor.changeViewZones((accessor) => {
        zoneIdsRef.current.forEach((id) => accessor.removeZone(id));
      });
      zoneIdsRef.current = [];
    }
    pendingYamlRef.current = null;
  }, []);

  const restoreReadOnly = useCallback((editor: Editor) => {
    if (lockedRef.current) {
      editor.updateOptions({ readOnly: originalReadOnlyRef.current });
      lockedRef.current = false;
    }
  }, []);

  // Lock the editor read-only from submit through preview so the diff overlay
  // can't go stale and Accept (which replaces the whole document) can't clobber
  // concurrent manual edits.
  const lockEditor = useCallback((editor: Editor) => {
    if (lockedRef.current) return;
    originalReadOnlyRef.current = !!editor.getRawOptions().readOnly;
    editor.updateOptions({ readOnly: true });
    lockedRef.current = true;
  }, []);

  // Match the spacer zone's height to the rendered widget so no code is hidden.
  const syncPromptZoneHeight = useCallback(
    (editor: Editor) => {
      const id = promptZoneIdRef.current;
      const zone = promptZoneRef.current;
      if (!id || !zone) return;
      const height = contentNode.offsetHeight;
      if (!height || zone.heightInPx === height) return;
      zone.heightInPx = height;
      editor.changeViewZones((accessor) => accessor.layoutZone(id));
    },
    [contentNode],
  );

  const removePromptZone = useCallback((editor: Editor) => {
    resizeObserverRef.current?.disconnect();
    resizeObserverRef.current = null;
    const id = promptZoneIdRef.current;
    if (id) {
      editor.changeViewZones((accessor) => accessor.removeZone(id));
      promptZoneIdRef.current = null;
      promptZoneRef.current = null;
    }
  }, []);

  // Move the content widget and its spacer zone so they sit below `endLine`.
  // Used on open and whenever the selection changes while prompting.
  const positionPrompt = useCallback(
    (editor: Editor, endLine: number) => {
      positionRef.current = { lineNumber: endLine, column: 1 };
      editor.layoutContentWidget(getWidget());

      const height =
        contentNode.offsetHeight || promptZoneRef.current?.heightInPx || 140;
      // remove + re-add in one transaction so the reserved gap moves atomically
      editor.changeViewZones((accessor) => {
        if (promptZoneIdRef.current) {
          accessor.removeZone(promptZoneIdRef.current);
        }
        const zone: monacoEditor.IViewZone = {
          afterLineNumber: endLine,
          heightInPx: height,
          domNode: document.createElement('div'),
        };
        promptZoneIdRef.current = accessor.addZone(zone);
        promptZoneRef.current = zone;
      });
    },
    [getWidget, contentNode],
  );

  const closeWidget = useCallback(
    (editor: Editor | null) => {
      if (editor) {
        removePromptZone(editor);
        if (widgetRef.current) {
          editor.removeContentWidget(widgetRef.current);
        }
      }
      isOpenRef.current = false;
      setOpen(false);
      setStatus('idle');
      setError(null);
      setQuery('');
    },
    [removePromptZone],
  );

  const renderPreview = useCallback(
    (editor: Editor, updatedYaml: string, currentYaml: string) => {
      const blocks = buildDiffBlocks(diffLines(currentYaml, updatedYaml));
      const model = editor.getModel();
      if (!model) return;

      pendingYamlRef.current = updatedYaml;

      const decorations = blocks
        .filter((b) => b.kind === 'removed')
        .map((b) => ({
          range: new Range(
            b.startLine,
            1,
            b.endLine,
            model.getLineMaxColumn(b.endLine),
          ),
          options: {
            isWholeLine: true,
            className: 'ai-diff-removed-line',
            marginClassName: 'ai-diff-removed-margin',
          },
        }));
      decorationsRef.current = editor.createDecorationsCollection(decorations);

      editor.changeViewZones((accessor) => {
        blocks
          .filter((b) => b.kind === 'added')
          .forEach((b) => {
            const dom = document.createElement('div');
            dom.className = 'ai-diff-added-zone';
            b.lines.forEach((line) => {
              const lineEl = document.createElement('div');
              lineEl.className = 'ai-diff-added-line';
              lineEl.textContent = line === '' ? ' ' : line;
              dom.appendChild(lineEl);
            });
            const id = accessor.addZone({
              afterLineNumber: b.afterLine,
              heightInLines: b.lines.length,
              domNode: dom,
            });
            zoneIdsRef.current.push(id);
          });
      });

      editor.layoutContentWidget(getWidget());
    },
    [getWidget],
  );

  const openPrompt = useCallback(() => {
    const editor = editorInstance;
    if (!editor || isOpenRef.current) return;
    if (editor.getRawOptions().readOnly) return;

    const sel = editor.getSelection();
    const startLine = sel?.startLineNumber ?? 1;
    const endLine = sel?.endLineNumber ?? startLine;
    setSelection({ start: startLine, end: endLine });

    // Keep the editor editable while composing the prompt; it is only locked
    // once a suggestion is being fetched / previewed (see lockEditor).
    isOpenRef.current = true;

    editor.addContentWidget(getWidget());
    // Anchor below the END of the selection (and reserve space) so the selected
    // code stays visible and the widget pushes code down rather than overlapping.
    positionPrompt(editor, endLine);

    const observer = new ResizeObserver(() => syncPromptZoneHeight(editor));
    observer.observe(contentNode);
    resizeObserverRef.current = observer;

    setQuery('');
    setError(null);
    setStatus('prompting');
    setOpen(true);
  }, [
    editorInstance,
    getWidget,
    contentNode,
    syncPromptZoneHeight,
    positionPrompt,
  ]);

  // Keep the latest opener reachable from the (once-registered) Monaco action.
  const openRef = useRef(openPrompt);
  useEffect(() => {
    openRef.current = openPrompt;
  }, [openPrompt]);

  // While the popover is open, mirror the live editor selection. The label
  // updates on every selection change, but the popover only *repositions* once
  // the selection is settled: on mouse-up for mouse selections (not on every
  // intermediate drag step), and immediately for keyboard/programmatic changes
  // (which have no drag). Repositioning is also skipped during loading/preview
  // so the popover stays put once a suggestion is being reviewed.
  useEffect(() => {
    if (!open || !editorInstance) return;
    const editor = editorInstance;

    const updateLabel = () => {
      const sel = editor.getSelection();
      const start = sel?.startLineNumber ?? 1;
      const end = sel?.endLineNumber ?? start;
      setSelection({ start, end });
    };

    const reposition = () => {
      if (statusRef.current !== 'prompting' && statusRef.current !== 'error') {
        return;
      }
      const sel = editor.getSelection();
      const end = sel?.endLineNumber ?? sel?.startLineNumber ?? 1;
      positionPrompt(editor, end);
    };

    updateLabel();

    const selectionSub = editor.onDidChangeCursorSelection((e) => {
      updateLabel();
      // Mouse selections settle on mouse-up; defer those to onMouseUp.
      if (e.source !== 'mouse') {
        reposition();
      }
    });
    const mouseUpSub = editor.onMouseUp(() => reposition());

    return () => {
      selectionSub.dispose();
      mouseUpSub.dispose();
    };
  }, [open, editorInstance, positionPrompt]);

  const handleSubmit = useCallback(async () => {
    const editor = editorInstance;
    if (!editor) return;
    const trimmed = queryRef.current.trim();
    if (!trimmed) return;

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setError(null);
    setStatus('loading');
    // Freeze the editor for the duration of the request and the preview.
    lockEditor(editor);

    try {
      // Read the selection live at submit time so the referenced range reflects
      // whatever is selected now, not when the popover first opened.
      const sel = editor.getSelection();
      const lineStart = sel?.startLineNumber ?? 1;
      const lineEnd = sel?.endLineNumber ?? lineStart;
      const currentYaml = editor.getValue();
      const updatedYaml = await suggestEdits({
        userQuery: trimmed,
        context: { line_start: lineStart, line_end: lineEnd },
        fullYaml: currentYaml,
        signal: controller.signal,
      });
      if (controller.signal.aborted) return;

      try {
        jsyaml.load(updatedYaml);
      } catch {
        // back to an editable prompt so the user can adjust and retry
        restoreReadOnly(editor);
        setError(t('ai-inline-edit.invalid-yaml'));
        setStatus('error');
        return;
      }

      const ops = diffLines(currentYaml, updatedYaml);
      if (!hasChanges(ops)) {
        restoreReadOnly(editor);
        setError(t('ai-inline-edit.no-changes'));
        setStatus('error');
        return;
      }

      renderPreview(editor, updatedYaml, currentYaml);
      setStatus('previewing');
    } catch (e) {
      if (controller.signal.aborted) return;
      restoreReadOnly(editor);
      setError((e as Error)?.message || 'Request failed');
      setStatus('error');
    }
  }, [editorInstance, renderPreview, lockEditor, restoreReadOnly, t]);

  const handleAccept = useCallback(() => {
    const editor = editorInstance;
    if (!editor) return;
    const updatedYaml = pendingYamlRef.current;

    clearPreview(editor);
    // readOnly must be lifted before executeEdits (Monaco ignores edits while
    // read-only); restoreReadOnly returns it to its pre-prompt value.
    restoreReadOnly(editor);

    if (updatedYaml != null) {
      const model = editor.getModel();
      if (model) {
        editor.executeEdits('ai-inline-edit', [
          { range: model.getFullModelRange(), text: updatedYaml },
        ]);
        editor.pushUndoStop();
      }
    }
    closeWidget(editor);
  }, [editorInstance, clearPreview, restoreReadOnly, closeWidget]);

  const handleDismiss = useCallback(() => {
    const editor = editorInstance;
    abortRef.current?.abort();
    if (editor) {
      clearPreview(editor);
      restoreReadOnly(editor);
    }
    closeWidget(editor);
  }, [editorInstance, clearPreview, restoreReadOnly, closeWidget]);

  // Register the Cmd/Ctrl-K action on the live editor (skip read-only editors).
  useEffect(() => {
    if (!editorInstance || readOnly) return;
    const action = editorInstance.addAction({
      id: ACTION_ID,
      label: t('ai-inline-edit.tooltip'),
      keybindings: [KeyMod.CtrlCmd | KeyCode.KeyK],
      contextMenuGroupId: 'modification',
      contextMenuOrder: 1.5,
      run: () => openRef.current(),
    });
    return () => action.dispose();
  }, [editorInstance, readOnly, t]);

  // Abort any in-flight request and reset shared state on teardown. Monaco
  // disposes its own widgets/decorations/zones when the editor instance dies.
  useEffect(() => {
    return () => {
      abortRef.current?.abort();
      resizeObserverRef.current?.disconnect();
      resizeObserverRef.current = null;
      isOpenRef.current = false;
      lockedRef.current = false;
      setAtom(DEFAULT_AI_INLINE_EDIT_STATE);
    };
  }, [editorInstance, setAtom]);

  const widget = open
    ? createPortal(
        <PromptWidget
          status={status}
          query={query}
          error={error}
          selectionStart={selection.start}
          selectionEnd={selection.end}
          onQueryChange={setQuery}
          onSubmit={handleSubmit}
          onAccept={handleAccept}
          onReject={handleDismiss}
          onCancel={handleDismiss}
        />,
        contentNode,
      )
    : null;

  return { widget };
}
