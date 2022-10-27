import React, { Suspense } from 'react';
import LuigiClient from '@luigi-project/client';
import pluralize from 'pluralize';
import { useMicrofrontendContext } from 'shared/contexts/MicrofrontendContext';
import { Spinner } from 'shared/components/Spinner/Spinner';
import { ResourcesList } from 'shared/components/ResourcesList/ResourcesList';
import { useTranslation } from 'react-i18next';

const ExtensibilityList = React.lazy(() =>
  import('../../components/Extensibility/ExtensibilityList'),
);

const ApiRuleServices = apiRule => {
  const { t } = useTranslation();
  const namespace = apiRule.metadata.namespace;
  const url = `/apis/networking.istio.io/v1beta1/namespaces/${namespace}/virtualservices`;
  const filterByOwnerRef = ({ metadata }) =>
    metadata.ownerReferences?.find(
      ref => ref.kind === 'APIRule' && ref.name === apiRule.metadata.name,
    );
  const { customResources } = useMicrofrontendContext();

  const extensibilityVirtualServices = customResources.find(
    cR => cR.general?.resource?.kind === 'VirtualService',
  );

  if (extensibilityVirtualServices) {
    return (
      <Suspense fallback={<Spinner />}>
        <ExtensibilityList
          filterFunction={filterByOwnerRef}
          overrideResMetadata={extensibilityVirtualServices}
          isCompact
          resourceUrl={url}
          hasDetailsView
          showTitle
          title={t('api-rules.virtual-services')}
          navigateFn={entry => {
            try {
              const {
                kind,
                metadata: { name, namespace },
              } = entry;

              const namespacePart = namespace ? `namespaces/${namespace}/` : '';
              const resourceTypePart =
                extensibilityVirtualServices.general.urlPath ||
                pluralize(kind.toLowerCase());

              LuigiClient.linkManager()
                .fromContext('cluster')
                .navigate(
                  namespacePart + resourceTypePart + '/details/' + name,
                );
            } catch (e) {
              alert(1);
            }
          }}
        />
      </Suspense>
    );
  } else
    return (
      <ResourcesList
        key="api-rule-services"
        {...{
          hasDetailsView: true,
          fixedPath: true,
          resourceUrl: url,
          resourceType: 'virtualservices',
          namespace,
          isCompact: true,
          showTitle: true,
          filter: filterByOwnerRef,
        }}
      />
    );
};
export default ApiRuleServices;
