import React, { ReactNode } from 'react';
import { Icon } from 'fundamental-react';
import { useTranslation } from 'react-i18next';

type LinkProps = {
  url: string;
  text?: string;
  className?: string;
  children?: ReactNode;
  dataTestId?: string;
};

export const Link = ({
  url,
  text,
  className,
  children,
  dataTestId,
}: LinkProps) => {
  const { t } = useTranslation();

  return (
    <a
      className={className}
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      data-test-id={dataTestId}
    >
      {text || children || url}
      <Icon
        glyph="action"
        size="s"
        // className="fd-margin-begin--tiny"
        className="fd-margin-begin--tiny fd-margin-end--tiny"
        ariaLabel={t('common.ariaLabel.new-tab-link')}
      />
    </a>
  );
};
