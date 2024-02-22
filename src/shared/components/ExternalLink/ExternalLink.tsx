import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from '@ui5/webcomponents-react';

import { spacing } from '@ui5/webcomponents-react-base';

type LinkProps = {
  url: string;
  text?: string;
  className?: string;
  children?: ReactNode;
  dataTestId?: string;
};

export const ExternalLink = ({
  url,
  text,
  className,
  children,
  dataTestId,
}: LinkProps) => {
  const { t } = useTranslation();

  return (
    <a
      className={`bsl-link ${className}`}
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      data-test-id={dataTestId}
    >
      {text || children || url}
      <Icon
        design="Information"
        name="inspect"
        className="bsl-icon-s"
        style={spacing.sapUiTinyMarginBegin}
        aria-label={t('common.ariaLabel.new-tab-link')}
      />
    </a>
  );
};
