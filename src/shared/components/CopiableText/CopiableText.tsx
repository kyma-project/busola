import { Button } from '@ui5/webcomponents-react';
import copyToClipboard from 'copy-to-clipboard';
import { useTranslation } from 'react-i18next';

import './CopiableText.scss';
import { useRef, useState } from 'react';

type CopiableTextProps = {
  textToCopy: string;
  buttonText?: string;
  children?: React.ReactNode;
  iconOnly?: boolean;
  disabled?: boolean;
};
export function CopiableText({
  textToCopy,
  buttonText,
  children,
  iconOnly,
  disabled,
}: CopiableTextProps) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleCopy = () => {
    copyToClipboard(textToCopy);
    setCopied(true);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  return (
    <div className="copiable-text">
      {!iconOnly ? children || textToCopy : null}
      <Button
        endIcon="copy"
        design="Transparent"
        className="sap-margin-begin-tiny"
        disabled={disabled}
        onClick={() => handleCopy()}
        tooltip={t('common.tooltips.copy-to-clipboard')}
      >
        {copied ? t('common.buttons.copied') : buttonText || ''}
      </Button>
    </div>
  );
}
