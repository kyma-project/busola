import { ReactNode } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import { Button, IllustratedMessage, Title } from '@ui5/webcomponents-react';
import '@ui5/webcomponents-fiori/dist/illustrations/AllIllustrations';
import { ExternalLink } from 'shared/components/ExternalLink/ExternalLink';

import './EmptyListComponent.scss';

type EmptyListComponentProps = {
  titleText: string;
  subtitleText: string;
  showButton?: boolean;
  buttonText?: string;
  url: string;
  onClick: () => null;
  children?: ReactNode;
  image?: 'TntNoApplications' | 'TntComponents';
};

export const EmptyListComponent = ({
  titleText,
  subtitleText,
  showButton,
  buttonText,
  url,
  onClick,
  children,
  image = 'TntNoApplications',
}: EmptyListComponentProps) => {
  const { t } = useTranslation();
  const subtitle = subtitleText ? (
    <Trans i18nKey={subtitleText} components={[<ExternalLink url={url} />]} />
  ) : (
    ''
  );

  if (showButton === undefined) {
    showButton = typeof onClick === 'function';
  }

  if (!buttonText) {
    buttonText = t('common.buttons.create');
  }

  return (
    <IllustratedMessage
      name={image}
      design="Auto"
      title={
        <Title level="H2" size="H2">
          {titleText}
        </Title>
      }
      subtitle={
        <p className="emptyListComponent__subtitle sap-margin-top-small">
          {subtitle}
        </p>
      }
    >
      <div className="emptyListComponent__buttons">
        {showButton && (
          <Button design="Emphasized" onClick={onClick}>
            {buttonText}
          </Button>
        )}
        {url && (
          <ExternalLink
            text="Learn More"
            url={url}
            buttonDesign="Transparent"
            type="button"
          />
        )}
      </div>
      {children}
    </IllustratedMessage>
  );
};
