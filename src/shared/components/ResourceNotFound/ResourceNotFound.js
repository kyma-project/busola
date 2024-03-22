import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';

import { DynamicPageComponent } from 'shared/components/DynamicPageComponent/DynamicPageComponent';
import { UI5Panel } from '../UI5Panel/UI5Panel';

export const ResourceNotFound = ({ resource, customMessage }) => {
  const { t } = useTranslation();
  return (
    <>
      <DynamicPageComponent
        title=""
        content={
          <UI5Panel
            title={
              customMessage
                ? customMessage
                : t('components.resource-not-found.messages.not-found', {
                    resource,
                  })
            }
          />
        }
      />
    </>
  );
};

ResourceNotFound.propTypes = {
  resource: PropTypes.string.isRequired,
  customMessage: PropTypes.string,
};
