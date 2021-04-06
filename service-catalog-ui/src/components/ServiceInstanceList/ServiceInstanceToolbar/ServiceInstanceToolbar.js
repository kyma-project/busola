import React from 'react';

import { FormInput } from 'fundamental-react';
import { serviceInstanceConstants } from 'helpers/constants';
import { Toolbar } from '@kyma-project/react-components';

const ServiceInstanceToolbar = ({
  searchQuery,
  searchFn,
  serviceInstancesExists,
}) => (
  <Toolbar
    background="#fff"
    title={serviceInstanceConstants.title}
    aria-label="title"
  >
    {serviceInstancesExists ? (
      <>
        <FormInput
          value={searchQuery}
          type="text"
          placeholder="Search"
          onChange={e => searchFn(e.target.value)}
          data-e2e-id="search"
        />
      </>
    ) : null}
  </Toolbar>
);

export default ServiceInstanceToolbar;
