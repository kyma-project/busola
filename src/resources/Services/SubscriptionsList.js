import React, { Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { Spinner } from 'shared/components/Spinner/Spinner';
import { ResourcesList } from 'shared/components/ResourcesList/ResourcesList';

import './ServiceDetails.scss';
import { useRecoilValue } from 'recoil';
import { extensionsState } from 'state/navigation/extensionsAtom';

const ExtensibilityList = React.lazy(() =>
  import('../../components/Extensibility/ExtensibilityList'),
);

export function SubscriptionsList({ namespace }) {
  const { t } = useTranslation();
  const extensions = useRecoilValue(extensionsState);

  const extensibilitySubscriptions = extensions?.find(
    cR => cR.general?.resource?.kind === 'Subscription',
  );

  const url = `/apis/eventing.kyma-project.io/v1alpha1/namespaces/${namespace}/subscriptions`;
  const getServiceName = ({ spec }) => {
    if (typeof spec?.sink !== 'string') return '';

    const startIndex = spec?.sink?.lastIndexOf('/') + 1;
    const nextDot = spec?.sink?.indexOf('.');
    return spec?.sink?.substring(startIndex, nextDot);
  };

  if (extensibilitySubscriptions)
    return (
      <Suspense fallback={<Spinner />}>
        <ExtensibilityList
          filterFunction={getServiceName}
          overrideResMetadata={extensibilitySubscriptions}
          isCompact
          resourceUrl={url}
          hasDetailsView
          showTitle
          disableCreate
          title={t('subscriptions')}
        />
      </Suspense>
    );

  return (
    <ResourcesList
      key="subscriptions-services"
      hasDetailsView
      resourceUrl={url}
      title={t('subscriptions')}
      resourceType={'subscriptions'}
      namespace={namespace}
      isCompact
      showTitle
      disableCreate
      filter={getServiceName}
    />
  );
}

export default SubscriptionsList;
