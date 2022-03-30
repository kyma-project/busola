import React from 'react';
import LuigiClient from '@luigi-project/client';
import { Button } from 'fundamental-react';
import { useNotification } from 'shared/contexts/NotificationContext';
import { useMicrofrontendContext } from 'shared/contexts/MicrofrontendContext';
import { handleDelete } from 'shared/components/GenericList/actionHandlers/simpleDelete';
import { Tooltip } from 'shared/components/Tooltip/Tooltip';
import { GenericList } from 'shared/components/GenericList/GenericList';
import { useTranslation } from 'react-i18next';

import renderRow from './ServiceInstanceRowRenderer';

const ServiceInstanceTable = ({
  data,
  deleteServiceInstance,
  loading,
  type,
  i18n,
}) => {
  const { features } = useMicrofrontendContext();
  const btpCatalogEnabled =
    features.BTP_CATALOG?.isEnabled &&
    features.SERVICE_CATALOG_READ_ONLY?.isReadOnly;
  const notification = useNotification();
  const { t } = useTranslation();

  function goToServiceCatalog() {
    LuigiClient.linkManager()
      .fromContext('namespace')
      .withParams({ selectedTab: type })
      .navigate('catalog');
  }

  if (loading) return 'Loading...';

  const rowRenderer = instance => renderRow({ instance, i18n });

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
              () => {},
              t,
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
      i18n={i18n}
    />
  );
};

export default ServiceInstanceTable;
