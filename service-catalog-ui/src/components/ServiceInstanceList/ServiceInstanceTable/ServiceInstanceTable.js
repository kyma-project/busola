import React from 'react';
import LuigiClient from '@luigi-project/client';
import { Button } from 'fundamental-react';
import {
  GenericList,
  handleDelete,
  useNotification,
  useMicrofrontendContext,
  Tooltip,
} from 'react-shared';

import renderRow from './ServiceInstanceRowRenderer';

const ServiceInstanceTable = ({
  data,
  deleteServiceInstance,
  loading,
  type,
}) => {
  const { features } = useMicrofrontendContext();
  const btpCatalogEnabled = features.BTP_CATALOG?.isEnabled;
  const notification = useNotification();

  function goToServiceCatalog() {
    LuigiClient.linkManager()
      .fromContext('namespace')
      .withParams({ selectedTab: type })
      .navigate('catalog');
  }

  if (loading) return 'Loading...';

  const rowRenderer = instance => renderRow(instance);

  const actions = btpCatalogEnabled
    ? []
    : [
        {
          name: 'Delete Instance',
          icon: 'delete',
          handler: entry =>
            handleDelete(
              'Service Instance',
              entry.metadata.uid,
              entry.metadata.name,
              notification,
              () => deleteServiceInstance(entry.metadata.name),
            ),
        },
      ];

  const headerRenderer = () => ['Name', 'Service Class', 'Plan', 'Status'];

  let addServiceInstanceButton = (
    <Button
      compact
      option="transparent"
      onClick={goToServiceCatalog}
      data-e2e-id="add-instance"
      glyph="add"
      disabled={btpCatalogEnabled}
    >
      Add Instance
    </Button>
  );
  if (btpCatalogEnabled) {
    addServiceInstanceButton = (
      <Tooltip content="Service Catalog is in readonly mode.">
        {addServiceInstanceButton}
      </Tooltip>
    );
  }

  return (
    <GenericList
      extraHeaderContent={addServiceInstanceButton}
      title="Manage Service Instances"
      actions={actions}
      entries={data}
      headerRenderer={headerRenderer}
      rowRenderer={rowRenderer}
      notFoundMessage="No Service Instances found"
      hasExternalMargin={false}
      textSearchProperties={['metadata.name']}
    />
  );
};

export default ServiceInstanceTable;
