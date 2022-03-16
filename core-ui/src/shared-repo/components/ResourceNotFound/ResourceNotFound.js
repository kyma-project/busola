import React from 'react';
import PropTypes from 'prop-types';
import { LayoutPanel } from 'fundamental-react';
import { useTranslation } from 'react-i18next';

import { PageHeader } from '../PageHeader/PageHeader';

export const ResourceNotFound = ({
  resource,
  breadcrumbs,
  customMessage,
  i18n,
}) => {
  const { t } = useTranslation(null, { i18n });
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
