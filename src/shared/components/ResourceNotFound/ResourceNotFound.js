import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';

import { PageHeader } from 'shared/components/PageHeader/PageHeader';
import { Panel } from '@ui5/webcomponents-react';

export const ResourceNotFound = ({ resource, breadcrumbs, customMessage }) => {
  const { t } = useTranslation();
  return (
    <>
      <PageHeader title="" breadcrumbItems={breadcrumbs} />
      <Panel fixed className="fd-has-padding-regular fd-margin--md">
        {customMessage
          ? customMessage
          : t('components.resource-not-found.messages.not-found', { resource })}
      </Panel>
    </>
  );
};

ResourceNotFound.propTypes = {
  resource: PropTypes.string.isRequired,
  breadcrumbs: PropTypes.arrayOf(PropTypes.object).isRequired,
  customMessage: PropTypes.string,
};
