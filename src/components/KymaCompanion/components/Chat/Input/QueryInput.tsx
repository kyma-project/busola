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

type QueryInputProps = {
  loading: boolean;
  sendPrompt: (prompt: string) => void;
};

export default function QueryInput({ loading, sendPrompt }: QueryInputProps) {
  const { t } = useTranslation();
  const textareaRef = useRef<TextAreaDomRef>(null);
  const [inputValue, setInputValue] = useState<string>('');
  const [rowCount, setRowCount] = useState(0);

  const checkLineCount = useCallback(() => {
    if (!textareaRef.current) return;

    const paddingBlock = 8;
    const borderSize = 1;
    const lineHeight = 21;

    const textarea = textareaRef.current;
    // Calculate content height
    const contentHeight =
      textarea.scrollHeight - 2 * paddingBlock - 2 * borderSize;
    // Calculate number of rows, ensuring at least 1 row
    const numberOfRows = Math.max(1, Math.round(contentHeight / lineHeight));

    setRowCount(numberOfRows);
  }, []);

  const onSubmitInput = () => {
    if (inputValue.length === 0) return;
    const prompt = inputValue;
    setInputValue('');
    sendPrompt(prompt);
  };

  useEffect(() => {
    if (!loading && textareaRef.current) {
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 100);
    }
  }, [loading]);

  useEffect(() => {
    const textarea = textareaRef.current;

    const mirrorElement = textarea?.shadowRoot?.querySelector(
      '.ui5-textarea-mirror',
    ) as HTMLElement;
    const innerElement = textarea?.shadowRoot?.querySelector(
      '.ui5-textarea-inner',
    ) as HTMLElement;

    if (mirrorElement && innerElement) {
      if (rowCount > 2) {
        mirrorElement.style.paddingRight = '2.75rem';
        innerElement.style.paddingRight = '2.75rem';
      } else if (rowCount <= 2) {
        mirrorElement.style.paddingRight = '4rem';
        innerElement.style.paddingRight = '4rem';
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
          growingMaxRows={20}
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
        <div className={`query-input-actions${rowCount > 2 ? '__column' : ''}`}>
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
