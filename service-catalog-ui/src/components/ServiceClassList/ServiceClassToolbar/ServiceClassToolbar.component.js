import React from 'react';

import { FormInput } from 'fundamental-react';
import { serviceClassConstants } from 'helpers/constants';
import { Toolbar } from '@kyma-project/react-components';

const ServiceClassToolbar = ({
  searchFn,
  serviceClassesExists,
  searchQuery,
}) => {
  return (
    <Toolbar
      background="#fff"
      title={serviceClassConstants.title}
      aria-label="title"
    >
      {serviceClassesExists && (
        <FormInput
          value={searchQuery}
          type="text"
          placeholder="Search"
          onChange={e => searchFn(e.target.value)}
          data-e2e-id="search"
        />
      )}
    </Toolbar>
  );
};

export default ServiceClassToolbar;
