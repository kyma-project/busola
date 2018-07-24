import React from 'react';
import Grid from 'styled-components-grid';
import { Icon } from '@kyma-project/react-components';
import { Link } from 'react-router-dom';
import { statusColor } from '../shared/utils-functions';
import { Element, GridWrapper } from '../shared/component-styles';
import { ConfirmationModal } from '../Modal/Modal';
import { getResourceDisplayName } from '../../commons/helpers';

const InstanceEntry = ({ entry, deleteInstance, refetch }) => {
  const handleDelete = async () => {
    await deleteInstance(entry.name);
    setTimeout(() => {
      if (typeof refetch === 'function') {
        refetch();
      }
    }, 1000);
  };

  const displayBindingsUsages = (bindings = []) => {
    switch (bindings.length) {
      case 0:
        return '-';
      case 1:
        return bindings[0].name;
      default:
        return `Multiple (${bindings.length})`;
    }
  };
  
  const entryName = entry && entry.name ? entry.name : '';

  return (
    <GridWrapper data-e2e-id='instances-item'>
      <Grid>
        <Grid.Unit size={0.2}>
          <Element color={'#0b74de'} fontWeight={'bold'} data-e2e-id='instance-name'>
            <Link to={`/details/${entry.name}`} data-e2e-id={`instance-name-${entryName}`}>{entry.name}</Link>
          </Element>
        </Grid.Unit>
        <Grid.Unit size={0.2}>
          <Element color={'#0a6ed1'} data-e2e-id={`instance-service-class-${entryName}`}>
            {getResourceDisplayName(entry.serviceClass)}
          </Element>
        </Grid.Unit>
        <Grid.Unit size={0.2}>
          <Element color={'#32363b'} data-e2e-id={`instance-service-plan-${entryName}`}>
            {getResourceDisplayName(entry.servicePlan)}
          </Element>
        </Grid.Unit>
        <Grid.Unit size={0.2}>
          <Element color={'#32363b'} data-e2e-id={`instance-external-bindings-${entryName}`}>
            {displayBindingsUsages(entry.serviceBindingUsages)}
          </Element>
        </Grid.Unit>
        <Grid.Unit size={0.1}>
          <Element color={statusColor(entry.status.type)} data-e2e-id={`instance-status-${entryName}`}>
            {entry.status.type}
          </Element>
        </Grid.Unit>
        <Grid.Unit size={0.1}>
          <ConfirmationModal
            title="Warning"
            message={`Are you sure you want to delete instance "${
              entry.name
            }?"`}
            modalOpeningComponent={<Icon>{'\uE03D'}</Icon>}
            handleConfirmation={handleDelete}
            entryName={entry.name}
          />
        </Grid.Unit>
      </Grid>
    </GridWrapper>
  );
};

export default InstanceEntry;
