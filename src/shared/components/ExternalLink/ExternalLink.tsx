import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Icon, Link } from '@ui5/webcomponents-react';

import { spacing } from '@ui5/webcomponents-react-base';

type LinkProps = {
  url: string;
  text?: string;
  className?: string;
  children?: ReactNode;
  design?: 'Default' | 'Subtle' | 'Emphasized';
  dataTestId?: string;
  style?: React.CSSProperties;
};

export const ExternalLink = ({
  url,
  text,
  className = '',
  children,
  design = 'Emphasized',
  dataTestId,
  style,
}: LinkProps) => {
  const { t } = useTranslation();
  console.log(className, design, style);

  return (
    <Link
      design={design}
      className={className}
      href={url}
      target="_blank"
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
    </Link>
  );
};
