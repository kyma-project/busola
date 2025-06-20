import {
  Button,
  Icon,
  Text,
  TextArea,
  TextAreaDomRef,
} from '@ui5/webcomponents-react';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import './QueryInput.scss';

type QueryInputProps = {
  loading: boolean;
  sendPrompt: (prompt: string) => void;
};

export default function QueryInput({ loading, sendPrompt }: QueryInputProps) {
  const { t } = useTranslation();
  const textareaRef = useRef<TextAreaDomRef>(null);

  useEffect(() => {
    setTimeout(() => {
      const textarea = textareaRef.current;

      const mirrorElement = textarea?.shadowRoot?.querySelector(
        '.ui5-textarea-mirror',
      ) as HTMLElement;
      const innerElement = textarea?.shadowRoot?.querySelector(
        '.ui5-textarea-inner',
      ) as HTMLElement;

      if (mirrorElement && innerElement) {
        mirrorElement.style.paddingRight = '70px';
        innerElement.style.paddingRight = '70px';
      }
    }, 500);
  }, []);

  const [inputValue, setInputValue] = useState<string>('');

  const onSubmitInput = () => {
    if (inputValue.length === 0) return;
    const prompt = inputValue;
    setInputValue('');
    sendPrompt(prompt);
  };

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
        <div className="query-input-actions">
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
