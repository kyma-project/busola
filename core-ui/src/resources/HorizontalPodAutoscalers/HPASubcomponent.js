import React, { useEffect, useState } from 'react';
import { useGet } from 'shared/hooks/BackendAPI/useGet';
import { useMicrofrontendContext } from 'shared/contexts/MicrofrontendContext';
import { EMPTY_TEXT_PLACEHOLDER } from 'shared/constants';
import { GenericList } from 'shared/components/GenericList/GenericList';
import { useTranslation } from 'react-i18next';
import { Link } from 'fundamental-react';
import { navigateToResource } from 'shared/helpers/universalLinks';
import { Tokens } from 'shared/components/Tokens';
import { MetricsBrief } from './helpers';

export const HPASubcomponent = props => {
  const { t } = useTranslation();
  const { namespaceId } = useMicrofrontendContext();
  const { data, error } = useGet(
    `/apis/autoscaling/v2beta2/namespaces/${namespaceId}/horizontalpodautoscalers`,
  );
  const [associatedHPA, setAssociatedHPA] = useState([]);

  const {
    kind,
    metadata: { name },
  } = props;

  useEffect(() => {
    if (data?.items?.length) {
      const hpas = data.items.filter(el => {
        const sameKind = el.spec.scaleTargetRef.kind === props.kind;
        const sameName = el.spec.scaleTargetRef.name === props.metadata.name;

        return sameKind && sameName;
      });

      setAssociatedHPA(hpas);
    }
  }, [data, kind, name, setAssociatedHPA, props.kind, props.metadata.name]);

  return (
    <GenericList
      entries={associatedHPA}
      key="associated-hpa-list"
      title={t('hpas.title')}
      textSearchProperties={['metadata.name']}
      notFoundMessage={EMPTY_TEXT_PLACEHOLDER}
      serverDataError={error}
      headerRenderer={() => [
        t('common.headers.name'),
        t('hpas.headers.metrics'),
        t('hpas.headers.min-pods'),
        t('hpas.headers.replicas'),
        t('hpas.headers.max-pods'),
        t('common.headers.status'),
      ]}
      rowRenderer={hpa => [
        <Link
          onClick={() =>
            navigateToResource({
              name: hpa.metadata.name,
              kind: 'horizontalpodautoscaler',
              namespace: namespaceId,
            })
          }
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
      ]}
    />
  );
};
