import React from 'react';
import PropTypes from 'prop-types';
import { Button } from '@ui5/webcomponents-react';
import copyToCliboard from 'copy-to-clipboard';
import { useTranslation } from 'react-i18next';

import { spacing } from '@ui5/webcomponents-react-base';
import './CopiableText.scss';

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
  return (
    <div className="copiable-text">
      {!iconOnly ? children || textToCopy : null}
      <Button
        icon="copy"
        iconEnd
        design="Transparent"
        style={spacing.sapUiTinyMarginBegin}
        disabled={disabled}
        onClick={() => copyToCliboard(textToCopy)}
        tooltip={t('common.tooltips.copy-to-clipboard')}
      >
        {buttonText ? buttonText : null}
      </Button>
    </div>
  );
}
