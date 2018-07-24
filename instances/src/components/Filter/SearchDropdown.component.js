import React from 'react';

import { Search } from '@kyma-project/react-components';
import Dropdown from './Dropdown.component';

const SearchDropdown = ({onChange}) => {
  return (
    <Dropdown name="Search">
      <Search placeholder="Search" onChange={onChange} />
    </Dropdown>
  );
};

export default SearchDropdown;
