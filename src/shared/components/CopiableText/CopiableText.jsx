import PropTypes from 'prop-types';
import { Button } from '@ui5/webcomponents-react';
import copyToClipboard from 'copy-to-clipboard';
import { useTranslation } from 'react-i18next';

import './CopiableText.scss';
import { useRef, useState } from 'react';

CopiableText.propTypes = {
  textToCopy: PropTypes.string.isRequired,
  buttonText: PropTypes.string,
  children: PropTypes.node,
  iconOnly: PropTypes.bool,
  disabled: PropTypes.bool,
};

export function CopiableText({
  textToCopy,
  buttonText,
  children,
  iconOnly,
  disabled,
}) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef(null);

  const handleCopy = () => {
    copyToClipboard(textToCopy);
    setCopied(true);

    clearTimeout(timeoutRef.current);
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
