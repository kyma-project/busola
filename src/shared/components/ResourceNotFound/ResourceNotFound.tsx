import { useTranslation } from 'react-i18next';

import { DynamicPageComponent } from 'shared/components/DynamicPageComponent/DynamicPageComponent';
import { UI5Card } from '../UI5Card/UI5Card';

type ResourceNotFoundProps = {
  resource: string;
  customMessage?: string;
  layoutCloseUrl?: string;
  layoutNumber?: 'startColumn' | 'midColumn' | 'endColumn';
};

export const ResourceNotFound = ({
  resource,
  customMessage,
  layoutCloseUrl,
  layoutNumber,
}: ResourceNotFoundProps) => {
  const { t } = useTranslation();
  const title = customMessage
    ? customMessage
    : t('components.resource-not-found.messages.not-found', {
        resource,
      });
  return (
    <DynamicPageComponent
      title=""
      content={<UI5Card title={title} accessibleName={`${title} card`} />}
      layoutCloseUrl={layoutCloseUrl}
      layoutNumber={layoutNumber}
    />
  );
};
