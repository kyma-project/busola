import React from 'react';
import PropTypes from 'prop-types';
import './CopiableText.scss';
import { Tooltip } from 'shared/components/Tooltip/Tooltip';
import { Button } from '@ui5/webcomponents-react';
import copyToCliboard from 'copy-to-clipboard';
import { useTranslation } from 'react-i18next';

CopiableText.propTypes = {
  textToCopy: PropTypes.string.isRequired,
  buttonText: PropTypes.string,
  children: PropTypes.node,
  iconOnly: PropTypes.bool,
  compact: PropTypes.bool,
};

export function CopiableText({
  textToCopy,
  buttonText,
  children,
  iconOnly,
  compact,
  ...buttonProps
}) {
  const { t } = useTranslation();
  return (
    <div className="copiable-text">
      {!iconOnly ? children || textToCopy : null}
      <Tooltip content={t('common.tooltips.copy-to-clipboard')} position="top">
        <Button
          compact={compact}
          icon="copy"
          design="Transparent"
          className="fd-margin-begin--tiny"
          onClick={() => copyToCliboard(textToCopy)}
          {...buttonProps}
        >
          {buttonText ? buttonText : null}
        </Button>
      </Tooltip>
    </div>
  );
}
