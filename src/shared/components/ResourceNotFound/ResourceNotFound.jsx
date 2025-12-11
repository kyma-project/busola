import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';

import { DynamicPageComponent } from 'shared/components/DynamicPageComponent/DynamicPageComponent';
import { UI5Panel } from '../UI5Panel/UI5Panel';

export const ResourceNotFound = ({
  resource,
  customMessage,
  layoutCloseUrl,
  layoutNumber,
}) => {
  const { t } = useTranslation();
  const title = customMessage
    ? customMessage
    : t('components.resource-not-found.messages.not-found', {
        resource,
      });
  return (
    <DynamicPageComponent
      title=""
      content={<UI5Panel title={title} accessibleName={`${title} panel`} />}
      layoutCloseUrl={layoutCloseUrl}
      layoutNumber={layoutNumber}
    />
  );
};

ResourceNotFound.propTypes = {
  resource: PropTypes.string.isRequired,
  customMessage: PropTypes.string,
};
