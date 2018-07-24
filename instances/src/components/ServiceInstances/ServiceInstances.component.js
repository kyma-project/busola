import React from 'react';
import styled from 'styled-components';
import HeaderServiceInstances from './InstanceHeader.component';
import EntryServiceInstances from './InstanceEntry.component';
import SearchDropdown from '../Filter/SearchDropdown.component';
import FilterDropdown from '../Filter/FilterDropdown.component';
import { Spinner, Toolbar, ThemeWrapper } from '@kyma-project/react-components';
import { EntriesWrapper } from '../shared/component-styles';
import Error from '../Error/Error';

const ServiceInstancesWrapper = styled.div`
  border-radius: 4px;
  margin: 34px;
  background-color: #ffffff;
  box-shadow: 0 0 2px 0 rgba(0, 0, 0, 0.08);
`;

class ServiceInstances extends React.Component {
  componentWillReceiveProps(newProps) {
    if (
      newProps.serviceInstances &&
      newProps.serviceInstances.serviceInstances &&
      newProps.serviceInstances.serviceInstances.length > 0 &&
      typeof newProps.filterItems === 'function' &&
      !newProps.serviceInstances.serviceInstances.error &&
      !newProps.filteredItems.filteredItems.error
    ) {
      newProps.filterItems();
    }
  }

  render() {
    const {
      filterClassesAndSetActiveFilters,
      deleteServiceInstance,
      filteredItems = {},
      allFilters = {},
      activeFilters = {},
      serviceInstances = {},
    } = this.props;

    const allItems = serviceInstances.serviceInstances || [];
    const items = filteredItems.filteredItems || [];

    const filters = allFilters.allFilters || [];
    const allActiveFilters = activeFilters.activeFilters || {};
    const labelFilter = filters.find(val => val.name === 'labels');

    // TODO: Remove this nasty workaround for apparent bug
    // https://github.com/apollographql/apollo-client/issues/2920
    // Possible solution: do resolver logic on component side
    const entries = items.map(entry => {
      const remoteEntry = allItems.find(
        remoteEntry => remoteEntry.name === entry.name,
      );

      return {
        ...entry,
        ...remoteEntry,
      };
    });

    const getEntriesServiceInstances = () => {
      if(serviceInstances.loading) {
        return <Spinner padding="20px" size="30px" color="rgba(50,54,58,0.6)" />
      }
      else if(entries.length > 0) {
        return entries.map((entry, index) => (
          <EntryServiceInstances
            key={index}
            entry={entry}
            refetch={serviceInstances.refetch}
            deleteInstance={deleteServiceInstance}
          />
        ))
      } else {
        return 'No Service Instances found'
      }
    }

    return (
      <ThemeWrapper>
        <Toolbar
          headline="Service Instances"
          description="You can configure the instances and manage bindings of each of your instantiated services here"
        >
          <SearchDropdown
            onChange={e =>
              filterClassesAndSetActiveFilters('search', e.target.value)
            }
          />
          <FilterDropdown
            onChange={filterClassesAndSetActiveFilters}
            filter={labelFilter}
            activeValues={allActiveFilters.labels}
          />
        </Toolbar>
        <Error error={serviceInstances.error} />
        <Error error={filteredItems.error} />
        <ServiceInstancesWrapper data-e2e-id='instances-wrapper'>
          <HeaderServiceInstances />
          <EntriesWrapper data-e2e-id='instances-items'>
            {getEntriesServiceInstances()}
          </EntriesWrapper>
        </ServiceInstancesWrapper>
      </ThemeWrapper>
    );
  }
}

export default ServiceInstances;
