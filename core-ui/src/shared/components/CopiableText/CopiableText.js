import React from 'react';
import PropTypes from 'prop-types';
import './CopiableText.scss';
import { Tooltip } from 'shared/components/Tooltip/Tooltip';
import { Button } from 'fundamental-react';
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
  i18n,
}) {
  const { t } = useTranslation(null, { i18n });
  return (
    <div className="copiable-text">
      {!iconOnly ? children || textToCopy : null}
      <Tooltip content={t('common.tooltips.copy-to-clipboard')} position="top">
        <Button
          compact={compact}
          glyph="copy"
          option="transparent"
          className="fd-margin-begin--tiny"
          onClick={() => copyToCliboard(textToCopy)}
        >
          {buttonText ? buttonText : null}
        </Button>
      </Tooltip>
    </div>
  );
}
