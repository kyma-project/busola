import React from 'react';
import { useRecoilValue } from 'recoil';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { useGetList } from 'shared/hooks/BackendAPI/useGet';
import { useUrl } from 'hooks/useUrl';
import { activeNamespaceIdState } from 'state/activeNamespaceIdAtom';
import { EMPTY_TEXT_PLACEHOLDER } from 'shared/constants';
import { GenericList } from 'shared/components/GenericList/GenericList';
import { Tokens } from 'shared/components/Tokens';
import { MetricsBrief } from './helpers';

export const HPASubcomponent = props => {
  const { t } = useTranslation();
  const { kind, name } = props.metadata?.ownerReferences?.[0] ?? {};
  const namespaceId = useRecoilValue(activeNamespaceIdState);
  const { resourceUrl } = useUrl();

  const hpaFilter = hpa => {
    if (!kind || !name) return true;
    return (
      hpa.spec?.scaleTargetRef?.kind === kind &&
      hpa.spec?.scaleTargetRef?.name === name
    );
  };

  const { data, error } = useGetList(hpaFilter)(
    `/apis/autoscaling/v2/namespaces/${namespaceId}/horizontalpodautoscalers`,
  );

  const rowRenderer = hpa => [
    <Link
      className="fd-link"
      to={resourceUrl({
        kind: 'horizontalpodautoscaler',
        metadata: {
          name: hpa.metadata.name,
          namespace: namespaceId,
        },
      })}
    >
      {hpa.metadata.name}
    </Link>,
    <MetricsBrief {...hpa} />,
    hpa.spec.minReplicas,
    hpa.status?.currentReplicas || EMPTY_TEXT_PLACEHOLDER,
    hpa.spec.maxReplicas,
    <Tokens
      tokens={
        hpa.status?.conditions?.reduce((result, condition) => {
          if (condition.status === 'True') {
            result.push(condition.type);
          }
          return result;
        }, []) || []
      }
    />,
  ];

  return (
    <GenericList
      entries={data ?? []}
      key="associated-hpa-list"
      title={t('hpas.title')}
      serverDataError={error}
      headerRenderer={() => [
        t('common.headers.name'),
        t('hpas.headers.metrics'),
        t('hpas.headers.min-pods'),
        t('hpas.headers.replicas'),
        t('hpas.headers.max-pods'),
        t('common.headers.status'),
      ]}
      rowRenderer={rowRenderer}
      searchSettings={{
        textSearchProperties: ['metadata.name'],
      }}
    />
  );
};
