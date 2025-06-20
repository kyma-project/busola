import { Button, Text, TextArea } from '@ui5/webcomponents-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import './QueryInput.scss';

type QueryInputProps = {
  loading: boolean;
  sendPrompt: (prompt: string) => void;
};

export default function QueryInput({ loading, sendPrompt }: QueryInputProps) {
  const { t } = useTranslation();

  const [inputValue, setInputValue] = useState<string>('');

  const onSubmitInput = () => {
    if (inputValue.length === 0) return;
    const prompt = inputValue;
    setInputValue('');
    sendPrompt(prompt);
  };

  return (
    <div className="outer-input-container sap-margin-x-small sap-margin-bottom-small sap-margin-top-tiny">
      <div className="input-container">
        <TextArea
          id="query-input"
          disabled={loading}
          growing
          growingMaxRows={50}
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
        <Button
          id="text-area-icon"
          icon="paper-plane"
          design="Emphasized"
          disabled={loading || inputValue.length === 0}
          onClick={loading ? () => {} : onSubmitInput}
        />
      </div>
      <Text id="disclaimer">{t('kyma-companion.disclaimer')}</Text>
    </div>
  );
}
