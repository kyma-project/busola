import { ReactNode, useMemo } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Button, IllustratedMessage, Title } from '@ui5/webcomponents-react';
import '@ui5/webcomponents-fiori/dist/illustrations/AllIllustrations';
import { ExternalLink } from 'shared/components/ExternalLink/ExternalLink';

import './EmptyListComponent.scss';

type EmptyListComponentProps = {
  titleText: string;
  subtitleText: string | ReactNode;
  showButton?: boolean;
  buttonText?: string;
  url: string;
  onClick: () => null;
  children?: ReactNode;
  image?: 'TntComponents' | 'NoEntries';
};

export const EmptyListComponent = ({
  titleText,
  subtitleText,
  showButton,
  buttonText,
  url,
  onClick,
  children,
  image = 'NoEntries',
}: EmptyListComponentProps) => {
  const { t } = useTranslation();

  const subtitle = useMemo(() => {
    if (!subtitleText) return '';
    if (typeof subtitleText !== 'string') return subtitleText;

    return (
      <Trans
        i18nKey={subtitleText}
        defaults={subtitleText}
        components={[<ExternalLink key={subtitleText} url={url} />]}
      />
    );
  }, [subtitleText, url]);

  if (showButton === undefined) {
    showButton = typeof onClick === 'function';
  }

  if (!buttonText) {
    buttonText = t('common.buttons.create');
  }

  return (
    <section aria-labelledby="empty-list-title">
      <IllustratedMessage
        className="emptyListComponent"
        name={image}
        design="Auto"
        title={
          <Title level="H2" size="H2" id="empty-list-title">
            {titleText}
          </Title>
        }
        subtitle={<span className="sap-margin-top-small">{subtitle}</span>}
      >
        <div className="emptyListComponent__buttons">
          {showButton && <Button onClick={onClick}>{buttonText}</Button>}
          {url && (
            <ExternalLink
              text={t('common.buttons.learn-more')}
              url={url}
              buttonDesign="Transparent"
              type="button"
            />
          )}
        </div>
        {children}
      </IllustratedMessage>
    </section>
  );
};
