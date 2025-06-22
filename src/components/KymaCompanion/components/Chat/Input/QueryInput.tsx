import {
  Button,
  Icon,
  Text,
  TextArea,
  TextAreaDomRef,
} from '@ui5/webcomponents-react';
import { useEffect, useRef, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import './QueryInput.scss';

// Layout constants
const PADDING_BLOCK = 8;
const BORDER_SIZE = 1;
const LINE_HEIGHT = 21;
const MAX_HEIGHT_RATIO = 0.65; // 65% of conversation canvas height
const FALLBACK_MAX_ROWS = 50;

// Padding constants for different row counts
const PADDING_MULTI_ROW = '2.75rem';
const PADDING_SINGLE_ROW = '4rem';
const ROW_THRESHOLD = 2;

type QueryInputProps = {
  loading: boolean;
  sendPrompt: (prompt: string) => void;
  containerRef: React.MutableRefObject<HTMLDivElement | null>;
};

export default function QueryInput({
  loading,
  sendPrompt,
  containerRef,
}: QueryInputProps) {
  const { t } = useTranslation();
  const textareaRef = useRef<TextAreaDomRef>(null);
  const [inputValue, setInputValue] = useState<string>('');
  const [rowCount, setRowCount] = useState(0);
  const [maxRows, setMaxRows] = useState(0);

  const checkLineCount = useCallback(() => {
    if (!textareaRef.current) return;

    const textarea = textareaRef.current;
    const contentHeight =
      textarea.scrollHeight - 2 * PADDING_BLOCK - 2 * BORDER_SIZE;

    const numberOfRows = Math.max(1, Math.round(contentHeight / LINE_HEIGHT));
    setRowCount(numberOfRows);
  }, []);

  const calculateMaxRows = useCallback(() => {
    if (!containerRef.current) return;

    const canvasHeight = containerRef.current.clientHeight;
    const maxAllowedHeight = canvasHeight * MAX_HEIGHT_RATIO;

    const availableContentHeight =
      maxAllowedHeight - 2 * PADDING_BLOCK - 2 * BORDER_SIZE;
    const calculatedMaxRows = Math.floor(availableContentHeight / LINE_HEIGHT);

    const finalMaxRows = Math.max(
      1,
      Math.min(calculatedMaxRows, FALLBACK_MAX_ROWS),
    );
    setMaxRows(finalMaxRows);
  }, [containerRef]);

  const onSubmitInput = () => {
    if (inputValue.length === 0) return;
    const prompt = inputValue;
    setInputValue('');
    sendPrompt(prompt);
  };

  useEffect(() => {
    if (!loading && textareaRef.current) {
      textareaRef.current?.focus();
    }
  }, [loading]);

  useEffect(() => {
    requestAnimationFrame(() => {
      calculateMaxRows();
    });

    const handleWindowResize = () => calculateMaxRows();
    window.addEventListener('resize', handleWindowResize);

    return () => {
      window.removeEventListener('resize', handleWindowResize);
    };
  }, [calculateMaxRows]);

  useEffect(() => {
    const textarea = textareaRef.current;

    const mirrorElement = textarea?.shadowRoot?.querySelector(
      '.ui5-textarea-mirror',
    ) as HTMLElement;
    const innerElement = textarea?.shadowRoot?.querySelector(
      '.ui5-textarea-inner',
    ) as HTMLElement;

    if (mirrorElement && innerElement) {
      if (rowCount > ROW_THRESHOLD) {
        mirrorElement.style.paddingRight = PADDING_MULTI_ROW;
        innerElement.style.paddingRight = PADDING_MULTI_ROW;
      } else if (rowCount <= ROW_THRESHOLD) {
        mirrorElement.style.paddingRight = PADDING_SINGLE_ROW;
        innerElement.style.paddingRight = PADDING_SINGLE_ROW;
      }
    }
  }, [rowCount]);

  useEffect(() => {
    setTimeout(() => {
      checkLineCount();
    }, 250);
  }, [inputValue, checkLineCount]);

  return (
    <div className="outer-query-input-container sap-margin-x-small sap-margin-bottom-small sap-margin-top-tiny">
      <div className="query-input-container">
        <TextArea
          ref={textareaRef}
          disabled={loading}
          growing
          growingMaxRows={maxRows}
          rows={1}
          placeholder={t('kyma-companion.placeholder')}
          value={inputValue}
          onKeyDown={e => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              onSubmitInput();
            }
          }}
          onInput={e => {
            setInputValue(e.target.value);
          }}
          valueState="None"
        />
        <div
          className={`query-input-actions${
            rowCount > ROW_THRESHOLD ? '__column' : ''
          }`}
        >
          <Icon
            id={`cancel-icon${
              loading || inputValue.length === 0 ? '-hidden' : ''
            }`}
            name="decline"
            mode="Interactive"
            design="Default"
            onClick={() => setInputValue('')}
          />
          <Button
            id="submit-icon"
            icon="paper-plane"
            design="Emphasized"
            disabled={loading || inputValue.length === 0}
            onClick={onSubmitInput}
          />
        </div>
      </div>
      <Text id="disclaimer">{t('kyma-companion.disclaimer')}</Text>
    </div>
  );
}
