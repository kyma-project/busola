import React from 'react';
import PropTypes from 'prop-types';
import { LayoutPanel } from 'fundamental-react';

import { PageHeader } from '../PageHeader/PageHeader';

export const ResourceNotFound = ({ resource, breadcrumbs, customMessage }) => {
  return (
    <>
      <PageHeader title="" breadcrumbItems={breadcrumbs} />
      <LayoutPanel className="fd-has-padding-regular fd-margin--md">
        {customMessage ? customMessage : `Such ${resource} doesn't exists.`}
      </LayoutPanel>
    </>
  );
};

ResourceNotFound.propTypes = {
  resource: PropTypes.string.isRequired,
  breadcrumbs: PropTypes.arrayOf(PropTypes.object).isRequired,
  customMessage: PropTypes.string,
};
