import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { Button, FlexBox, Icon, Link } from '@ui5/webcomponents-react';
import { sanitizeUrl } from 'shared/helpers/sanitizeUrl';

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
  const safeUrl = sanitizeUrl(url);

  if (type === 'button') {
    return (
      <Button
        accessibleRole="Link"
        accessibleName={text || children?.toString() || url}
        accessibleDescription="Open in new tab link"
        endIcon="inspect"
        design={buttonDesign}
        className="sap-margin-x-tiny"
        onClick={() => {
          const newWindow = window.open(
            safeUrl,
            '_blank',
            'noopener, noreferrer',
          );
          if (newWindow) newWindow.opener = null;
        }}
      >
        {text || children || url}
      </Button>
    );
  }

  return (
    <Link
      design={design}
      href={safeUrl}
      target="_blank"
      className={linkClassName}
      accessibleName={text || children?.toString() || url}
      accessibleDescription="Open in new tab link"
    >
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
