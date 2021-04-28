import React from 'react';
import PropTypes from 'prop-types';
import { LayoutPanel } from 'fundamental-react';

import { PageHeader } from '../PageHeader/PageHeader';

export const DetailsError = ({ breadcrumbs, message }) => {
  return (
    <>
      <PageHeader title="" breadcrumbItems={breadcrumbs} />
      <LayoutPanel className="fd-has-padding-regular fd-margin--md">
        {message}
      </LayoutPanel>
    </>
  );
};

DetailsError.propTypes = {
  breadcrumbs: PropTypes.arrayOf(PropTypes.object).isRequired,
  message: PropTypes.string.isRequired,
};
