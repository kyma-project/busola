import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, FlexBox, Icon, Link } from '@ui5/webcomponents-react';

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
  iconClassName?: string;
  type?: 'link' | 'button';
  linkClassName?: string;
};

export const ExternalLink = ({
  url,
  text,
  children,
  design = 'Default',
  buttonDesign = 'Transparent',
  iconClassName,
  type = 'link',
  linkClassName,
}: LinkProps) => {
  const { t } = useTranslation();

  if (type === 'button') {
    return (
      <Button
        accessibleRole="Link"
        endIcon="inspect"
        design={buttonDesign}
        className="sap-margin-x-tiny"
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
    <Link design={design} href={url} target="_blank" className={linkClassName}>
      <FlexBox alignItems="Center">
        {text || children || url}
        <Icon
          design="Information"
          name="inspect"
          className={`bsl-icon-s sap-margin-begin-tiny ${iconClassName}`}
          style={{
            marginRight: '0.15rem',
          }}
          accessibleName={t('common.ariaLabel.new-tab-link')}
        />
      </FlexBox>
    </Link>
  );
};
