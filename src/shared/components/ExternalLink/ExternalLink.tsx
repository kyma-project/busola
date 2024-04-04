import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Icon, Link } from '@ui5/webcomponents-react';

import { spacing } from '@ui5/webcomponents-react-base';

type LinkProps = {
  url: string;
  text?: string;
  className?: string;
  children?: ReactNode;
  design?: 'Default' | 'Subtle' | 'Emphasized';
  iconStyle?: React.CSSProperties;
  type?: 'link' | 'button';
};

export const ExternalLink = ({
  url,
  text,
  children,
  design = 'Default',
  iconStyle,
  type = 'link',
}: LinkProps) => {
  const { t } = useTranslation();

  if (type === 'button') {
    return (
      <Button
        icon="inspect"
        iconEnd
        style={spacing.sapUiTinyMarginBeginEnd}
        onClick={() => {
          const newWindow = window.open(url, '_blank', 'noopener, noreferrer');
          if (newWindow) newWindow.opener = null;
        }}
      >
        {text || children || url}
      </Button>
    );
  }

  return (
    <Link design={design} href={url} target="_blank">
      {text || children || url}
      <Icon
        design="Information"
        name="inspect"
        className="bsl-icon-s"
        style={{
          ...spacing.sapUiTinyMarginBegin,
          marginRight: '0.15rem',
          ...(iconStyle || {}),
        }}
        aria-label={t('common.ariaLabel.new-tab-link')}
      />
    </Link>
  );
};
