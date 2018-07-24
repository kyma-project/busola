import React from 'react';
import styled from 'styled-components';
import { Paragraph } from '@kyma-project/react-components';

import FilterList from '../Filter/FilterList.component';
import Card from '../Card/Card.component';
import ColumnsWrapper from '../ColumnsWrapper/ColumnsWrapper.component';
import { getResourceDisplayName } from '../../commons/helpers';
const CardsWrapper = styled.div`
  box-sizing: border-box;
  display: flex;
  flex-flow: row wrap;
  width: 100%;
  padding: 0 20px;
`;

const Message = styled.div`
  padding: 20px 0;
`;

class ServiceClassList extends React.Component {
  componentWillReceiveProps(newProps) {
    if (
      newProps.serviceClasses &&
      newProps.serviceClasses.length > 0 &&
      typeof newProps.filterServiceClasses === 'function'
    ) {
      newProps.filterServiceClasses();
    }
  }

  render() {
    const {
      classList,
      activeClassFilters,
      classFilters,
      setServiceClassesFilter,
      history,
    } = this.props;
    const activeFilters = activeClassFilters.activeServiceClassFilters || {};
    let items = classList.filteredServiceClasses || [];

    //its used for filtering class which does not have any name in it (either externalName, displayName or name).
    items = items.filter(e => e.displayName || e.externalName || e.name);
    return (
      <ColumnsWrapper>
        {!classFilters.loading && (
          <FilterList
            filters={classFilters.serviceClassFilters}
            active={activeFilters}
            onChange={(key, value) => setServiceClassesFilter(key, value)}
          />
        )}

        {items && (
          <CardsWrapper data-e2e-id="cards">
            {items.length === 0 ? (
              <Message>
                <Paragraph>No ServiceClasses found.</Paragraph>
              </Message>
            ) : (
              items.map(item => (
                <Card
                  key={item.name}
                  onClick={() => history.push(`/details/${item.name}`)}
                  item={{
                    title: getResourceDisplayName(item),
                    company: item.providerDisplayName,
                    description: item.description,
                  }}
                />
              ))
            )}
          </CardsWrapper>
        )}
      </ColumnsWrapper>
    );
  }
}
export default ServiceClassList;
