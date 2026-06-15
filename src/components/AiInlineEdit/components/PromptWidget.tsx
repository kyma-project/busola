import { useEffect, useRef } from 'react';
import {
  Button,
  Icon,
  MessageStrip,
  TextArea,
  TextAreaDomRef,
} from '@ui5/webcomponents-react';
import { useTranslation } from 'react-i18next';
import { Spinner } from 'shared/components/Spinner/Spinner';
import { AiInlineEditStatus } from 'state/aiEditor/aiInlineEditAtom';

export type PromptWidgetProps = {
  status: AiInlineEditStatus;
  query: string;
  error: string | null;
  selectionStart: number;
  selectionEnd: number;
  onQueryChange: (_query: string) => void;
  onSubmit: () => void;
  onAccept: () => void;
  onReject: () => void;
  onCancel: () => void;
};

export function PromptWidget({
  status,
  query,
  error,
  selectionStart,
  selectionEnd,
  onQueryChange,
  onSubmit,
  onAccept,
  onReject,
  onCancel,
}: PromptWidgetProps) {
  const { t } = useTranslation();
  const textareaRef = useRef<TextAreaDomRef>(null);

  const isPreviewing = status === 'previewing';
  const isLoading = status === 'loading';
  const canEditQuery = status === 'prompting' || status === 'error';

  const selectionLabel =
    selectionStart === selectionEnd
      ? t('ai-inline-edit.selected-line', { line: selectionStart })
      : t('ai-inline-edit.selected-lines', {
          start: selectionStart,
          end: selectionEnd,
        });

  // Focus the inner textarea when the prompt is editable (same approach as the
  // Kyma Companion input, which reaches into the web component's shadow DOM).
  useEffect(() => {
    if (canEditQuery) {
      requestAnimationFrame(() => {
        const inner = textareaRef.current?.shadowRoot?.querySelector(
          '.ui5-textarea-inner',
        ) as HTMLElement | null;
        inner?.focus();
      });
    }
  }, [canEditQuery]);

  return (
    // Stop mousedown from reaching the editor so clicks focus the widget
    // instead of moving the editor caret / blurring inputs.
    <div
      className="ai-inline-edit-widget"
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div className="ai-inline-edit-widget__header">
        <span className="ai-inline-edit-widget__title">
          <Icon name="ai" />
          {t('ai-inline-edit.tooltip')}
        </span>
        <Button
          design="Transparent"
          icon="decline"
          className="ai-inline-edit-widget__close"
          tooltip={t('ai-inline-edit.close')}
          onClick={onCancel}
        />
      </div>

      {!isPreviewing && (
        <span className="ai-inline-edit-widget__context">{selectionLabel}</span>
      )}

      {error && (
        <MessageStrip design="Negative" hideCloseButton role="alert">
          {error}
        </MessageStrip>
      )}

      {isLoading && (
        <div className="ai-inline-edit-widget__row">
          <Spinner size="S" center={false} />
          {t('ai-inline-edit.generating')}
        </div>
      )}

      {isPreviewing && (
        <>
          <span>{t('ai-inline-edit.review')}</span>
          <div className="ai-inline-edit-widget__actions">
            <Button design="Transparent" onClick={onReject}>
              {t('ai-inline-edit.discard')}
            </Button>
            <Button design="Emphasized" onClick={onAccept}>
              {t('ai-inline-edit.accept')}
            </Button>
          </div>
        </>
      )}

      {canEditQuery && (
        <div className="ai-inline-edit-widget__input">
          <TextArea
            ref={textareaRef}
            growing
            rows={1}
            growingMaxRows={6}
            placeholder={t('ai-inline-edit.placeholder')}
            value={query}
            onInput={(e) => onQueryChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (query.trim()) onSubmit();
              } else if (e.key === 'Escape') {
                e.preventDefault();
                onCancel();
              }
            }}
          />
          <div className="ai-inline-edit-widget__input-actions">
            <Button
              icon="paper-plane"
              design="Emphasized"
              className="ai-inline-edit-widget__send"
              tooltip={
                status === 'error'
                  ? t('ai-inline-edit.retry')
                  : t('ai-inline-edit.submit')
              }
              disabled={!query.trim()}
              onClick={onSubmit}
            />
          </div>
        </div>
      )}
    </div>
  );
}
