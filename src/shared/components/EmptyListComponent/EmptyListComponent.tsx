import { ReactNode } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import { Button, IllustratedMessage } from '@ui5/webcomponents-react';
import '@ui5/webcomponents-fiori/dist/illustrations/tnt/NoApplications.js';
import { Link } from 'shared/components/Link/Link';
import './EmptyListComponent.scss';
import { spacing } from '@ui5/webcomponents-react-base';

type EmptyListComponentProps = {
  titleText: string;
  subtitleText: string;
  showButton?: boolean;
  buttonText?: string;
  url: string;
  onClick: () => null;
  children?: ReactNode;
};

export const EmptyListComponent = ({
  titleText,
  subtitleText,
  showButton = true,
  buttonText,
  url,
  onClick,
  children,
}: EmptyListComponentProps) => {
  const { t } = useTranslation();
  const subtitle = <Trans i18nKey={subtitleText}></Trans>;

  if (!buttonText) {
    buttonText = t('common.buttons.create');
  }

  return (
    <>
      <IllustratedMessage
        name="TntNoApplications"
        size="Scene"
        titleText={titleText}
        subtitle={
          <p
            className="emptyListComponent__subtitle"
            style={spacing.sapUiSmallMarginTop}
          >
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
            <Link
              className="emptyListComponent__link"
              text="Learn More"
              url={url}
            />
          )}
        </div>
        {children}
      </IllustratedMessage>
    </>
  );
};
