import React from 'react';
import Grid from 'styled-components-grid';
import { Icon } from '@kyma-project/react-components';
import { Element, GridWrapper } from '../shared/component-styles';
import { ConfirmationModal, InformationModal } from '../Modal/Modal';
import SecretData from './SecretData.component';
import BindingDeletion from './BindingDeletion.component';

const BindingEntry = ({
  entry,
  deleteBindingUsage,
  deleteBinding,
  bindingUsageCount,
  refetch,
}) => {
  const capitalize = str => {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  const handleDeletion = async (
    shouldDeleteBindingUsage,
    shouldDeleteBinding,
  ) => {
    if (shouldDeleteBindingUsage) {
      await deleteBindingUsage(entry.name);
    }
    if (shouldDeleteBinding && entry.serviceBinding) {
      await deleteBinding(entry.serviceBinding.name);
    }

    setTimeout(() => {
      if (typeof refetch === 'function') {
        refetch();
      }
    }, 500);
  };

  const serviceBinding = entry.serviceBinding;
  const secret = serviceBinding && entry.serviceBinding.secret;
  return (
    <GridWrapper>
      <Grid>
        <Grid.Unit size={0.25}>
          <Element color={'#0b74de'} fontWeight={'bold'}>
            {entry.name}
          </Element>
        </Grid.Unit>
        <Grid.Unit size={0.25}>
          <Element color={'#32363b'}>
            {entry.usedBy.name} ({capitalize(entry.usedBy.kind)})
          </Element>
        </Grid.Unit>
        <Grid.Unit size={0.2}>
          <Element color={'#32363b'}>
            {serviceBinding && serviceBinding.name}
          </Element>
        </Grid.Unit>
        <Grid.Unit size={0.2}>
          {secret && (
            <InformationModal
              title={`Secret "${secret.name}"`}
              content={<SecretData data={secret.data} />}
              modalOpeningComponent={secret.name}
            />
          )}
        </Grid.Unit>
        <Grid.Unit size={0.1}>
          <ConfirmationModal
            title="Which resources would you like to delete?"
            contentComponent={BindingDeletion}
            contentComponentProps={{
              bindingUsageCount,
              handleDeletion,
              bindingName: (serviceBinding && serviceBinding.name) || null,
              bindingExists: Boolean(serviceBinding),
              bindingUsageName: entry.name,
            }}
            modalOpeningComponent={<Icon>{'\uE03D'}</Icon>}
            entryName='binding'
          />
        </Grid.Unit>
      </Grid>
    </GridWrapper>
  );
};

export default BindingEntry;
