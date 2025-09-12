import React, { Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { Spinner } from 'shared/components/Spinner/Spinner';
import { ResourcesList } from 'shared/components/ResourcesList/ResourcesList';

import { useAtomValue } from 'jotai';
import { extensionsAtom } from 'state/navigation/extensionsAtom';
import { activeNamespaceIdAtom } from 'state/activeNamespaceIdAtom';

const ExtensibilityList = React.lazy(
  () => import('../../components/Extensibility/ExtensibilityList'),
);

export const HPASubcomponent = (props) => {
  const { t } = useTranslation();
  const resourceKind = props.kind;
  const resourceName = props.metadata.name;
  const namespace = useAtomValue(activeNamespaceIdAtom);
  const extensions = useAtomValue(extensionsAtom);

  const extensibilityHPAs = extensions?.find(
    (cR) => cR.general?.resource?.kind === 'HorizontalPodAutoscaler',
  );

  const url = `/apis/autoscaling/v2/namespaces/${namespace}/horizontalpodautoscalers`;
  const hpaFilter = (hpa) => {
    return (
      hpa.spec?.scaleTargetRef?.kind === resourceKind &&
      hpa.spec?.scaleTargetRef?.name === resourceName
    );
  };

  if (extensibilityHPAs)
    return (
      <Suspense key="horizontal-pod-autoscalers" fallback={<Spinner />}>
        <ExtensibilityList
          displayArrow={false}
          disableHiding={true}
          filterFunction={hpaFilter}
          overrideResMetadata={extensibilityHPAs}
          isCompact
          resourceUrl={url}
          hasDetailsView
          showTitle
          disableCreate
          title={t('horizontal-pod-autoscalers')}
        />
      </Suspense>
    );

  return (
    <ResourcesList
      displayArrow={false}
      disableHiding={true}
      key="horizontal-pod-autoscalers"
      hasDetailsView
      resourceUrl={url}
      title={t('horizontal-pod-autoscalers')}
      resourceType={'horizontalPodAutoscalers'}
      namespace={namespace}
      isCompact
      showTitle
      disableCreate
      filter={hpaFilter}
    />
  );
};
