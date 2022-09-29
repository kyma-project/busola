import React from 'react';
import PropTypes from 'prop-types';
import { Icon } from 'fundamental-react';
import { useTranslation } from 'react-i18next';

export const Link = ({ url, text, className, children }) => {
  const { t } = useTranslation;

  return (
    <a
      className={className}
      href={url}
      target="_blank"
      rel="noopener noreferrer"
    >
      {text || children || url}
      <Icon
        glyph="inspect"
        size="s"
        className="fd-margin-begin--tiny"
        ariaLabel={t('common.tooltips.new-tab-link')}
      />
    </a>
  );
};

Link.propTypes = {
  url: PropTypes.string.isRequired,
  text: PropTypes.string,
};
