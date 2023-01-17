import React from 'react';
import PropTypes from 'prop-types';
import { LayoutPanel } from 'fundamental-react';
import { useTranslation } from 'react-i18next';

import { PageHeader } from 'shared/components/PageHeader/PageHeader';

export const ResourceNotFound = ({ resource, breadcrumbs, customMessage }) => {
  const { t } = useTranslation();
  return (
    <>
      <PageHeader title="" breadcrumbItems={breadcrumbs} />
      <LayoutPanel className="fd-has-padding-regular fd-margin--md">
        {customMessage
          ? customMessage
          : t('components.resource-not-found.messages.not-found', { resource })}
      </LayoutPanel>
    </>
  );
};

ResourceNotFound.propTypes = {
  resource: PropTypes.string.isRequired,
  breadcrumbs: PropTypes.arrayOf(PropTypes.object).isRequired,
  customMessage: PropTypes.string,
};
