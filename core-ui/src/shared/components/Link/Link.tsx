import React, { ReactNode } from 'react';
import { Icon } from 'fundamental-react';
import { useTranslation } from 'react-i18next';

type LinkProps = {
  url: string;
  text?: string;
  className?: string;
  children?: ReactNode;
};

export const Link = ({ url, text, className, children }: LinkProps) => {
  const { t } = useTranslation();

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
        ariaLabel={t('common.ariaLabel.new-tab-link')}
      />
    </a>
  );
};
