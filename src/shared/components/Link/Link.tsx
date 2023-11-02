import { Icon } from '@ui5/webcomponents-react';
import React, { ReactNode } from 'react';
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
        design="Information"
        name="action"
        className="bsl-margin-begin--tiny bsl-margin-end--tiny bsl-icon-s"
        aria-label={t('common.ariaLabel.new-tab-link')}
      />
    </a>
  );
};
