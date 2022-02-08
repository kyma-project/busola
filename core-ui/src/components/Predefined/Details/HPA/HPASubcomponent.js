import React, { useEffect, useState } from 'react';
import {
  useGet,
  GenericList,
  EMPTY_TEXT_PLACEHOLDER,
  useMicrofrontendContext,
} from 'react-shared';
import { useTranslation } from 'react-i18next';
import { Link } from 'fundamental-react';
import { navigateToResource } from 'shared/helpers/universalLinks';
import { Tokens } from 'shared/components/Tokens';
import { MetricsBrief } from '../HPA/helpers';

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
      title={t('hpas.applicable-hpa')}
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
              kind: 'hpa',
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
