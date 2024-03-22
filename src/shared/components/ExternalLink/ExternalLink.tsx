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
  iconStyle?: React.CSSProperties;
};

export const ExternalLink = ({
  url,
  text,
  children,
  design = 'Default',
  iconStyle,
}: LinkProps) => {
  const { t } = useTranslation();

  return (
    <Link design={design} href={url} target="_blank">
      {text || children || url}
      <Icon
        design="Information"
        name="inspect"
        className="bsl-icon-s"
        style={{
          ...spacing.sapUiTinyMarginBegin,
          marginRight: '0.25rem',
          ...(iconStyle || {}),
        }}
        aria-label={t('common.ariaLabel.new-tab-link')}
      />
    </Link>
  );
};
