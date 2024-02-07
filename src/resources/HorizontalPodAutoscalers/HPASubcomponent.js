import React, { Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { Spinner } from 'shared/components/Spinner/Spinner';
import { ResourcesList } from 'shared/components/ResourcesList/ResourcesList';

import { useRecoilValue } from 'recoil';
import { extensionsState } from 'state/navigation/extensionsAtom';
import { activeNamespaceIdState } from 'state/activeNamespaceIdAtom';

const ExtensibilityList = React.lazy(() =>
  import('../../components/Extensibility/ExtensibilityList'),
);

export const HPASubcomponent = props => {
  const { t } = useTranslation();
  const { kind, name } = props.metadata?.ownerReferences?.[0] ?? {};
  const namespace = useRecoilValue(activeNamespaceIdState);
  const extensions = useRecoilValue(extensionsState);

  const extensibilityHPAs = extensions?.find(
    cR => cR.general?.resource?.kind === 'HorizontalPodAutoscaler',
  );

  const url = `/apis/autoscaling/v2/namespaces/${namespace}/horizontalpodautoscalers`;
  const hpaFilter = hpa => {
    if (!kind || !name) return true;
    return (
      hpa.spec?.scaleTargetRef?.kind === kind &&
      hpa.spec?.scaleTargetRef?.name === name
    );
  };

  if (extensibilityHPAs)
    return (
      <Suspense fallback={<Spinner />}>
        <ExtensibilityList
          displayLabelForLabels={false}
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
      displayLabelForLabels={false}
      key="horizontal-pod-autoscalers"
      hasDetailsView
      resourceUrl={url}
      title={t('horizontal-pod-autoscalers')}
      resourceType={'horizontalpodautoscalers'}
      namespace={namespace}
      isCompact
      showTitle
      disableCreate
      filter={hpaFilter}
    />
  );
};
