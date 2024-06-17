import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, FlexBox, Icon, Link } from '@ui5/webcomponents-react';

import { spacing } from '@ui5/webcomponents-react-base';

type LinkProps = {
  url: string;
  text?: string;
  className?: string;
  children?: ReactNode;
  design?: 'Default' | 'Subtle' | 'Emphasized';
  buttonDesign?:
    | 'Positive'
    | 'Negative'
    | 'Transparent'
    | 'Default'
    | 'Emphasized'
    | 'Attention';
  iconStyle?: React.CSSProperties;
  type?: 'link' | 'button';
  linkStyle?: React.CSSProperties;
};

export const ExternalLink = ({
  url,
  text,
  children,
  design = 'Default',
  buttonDesign = 'Transparent',
  iconStyle,
  type = 'link',
  linkStyle,
}: LinkProps) => {
  const { t } = useTranslation();

  if (type === 'button') {
    return (
      <Button
        icon="inspect"
        design={buttonDesign}
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
    <Link design={design} href={url} target="_blank" style={linkStyle}>
      <FlexBox alignItems="Center">
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
      </FlexBox>
    </Link>
  );
};
