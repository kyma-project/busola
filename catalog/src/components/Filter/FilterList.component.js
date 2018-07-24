import React, { Fragment } from 'react';
import styled from 'styled-components';
import { Separator } from '@kyma-project/react-components';

import Filter from './Filter.component';

const FilterContainer = styled.div`
  box-sizing: border-box;
  width: 300px;
  margin: 14px 30px;
  text-align: left;
`;

const FilterList = ({ filters, active, onChange }) => (
  <FilterContainer data-e2e-id="filter">
    {filters.map((filter, idx) => (
      <Fragment key={filter.name}>
        <Filter
          name={filter.name}
          items={filter.values}
          activeValue={active[filter.name]}
          onChange={onChange}
        />
        {idx < filters.length - 1 && <Separator margin="25px 0 15px" />}
      </Fragment>
    ))}
  </FilterContainer>
);

export default FilterList;
