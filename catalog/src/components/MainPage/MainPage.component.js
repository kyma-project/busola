import React from 'react';
import styled from 'styled-components';

import ServiceClassList from '../ServiceClassList/ServiceClassList.container';
import { Toolbar, ThemeWrapper, Search } from '@kyma-project/react-components';

import './MainPage.css';

const SearchWrapper = styled.div`
  width: 390px;
`;

const MainPage = ({
  history,
  serviceClasses,
  filterClasses,
  filterClassesAndSetActiveFilters,
}) => {
  const searchFn = e =>
    filterClassesAndSetActiveFilters('search', e.target.value);

  return (
    <ThemeWrapper>
      <div className="App">
        <Toolbar
          back={() => {
            history.goBack();
          }}
          largeBackButton
          headline="Service Catalog"
          description="Enrich your experience with additional services"
        >
          <SearchWrapper>
            <Search placeholder="Search" onChange={searchFn} />
          </SearchWrapper>
        </Toolbar>
        {!serviceClasses.loading && (
          <ServiceClassList
            serviceClasses={serviceClasses.serviceClasses}
            filterServiceClasses={filterClasses}
            setServiceClassesFilter={filterClassesAndSetActiveFilters}
            history={history}
          />
        )}
      </div>
    </ThemeWrapper>
  );
};

export default MainPage;
