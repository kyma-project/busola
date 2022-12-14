import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { useGet } from 'shared/hooks/BackendAPI/useGet';
import { EMPTY_TEXT_PLACEHOLDER } from 'shared/constants';
import { Tooltip } from 'shared/components/Tooltip/Tooltip';
import { DefinitionList } from 'shared/components/DefinitionList/DefinitionList';
import { useUrl } from 'hooks/useUrl';
import { ServiceInstanceLink } from './ServiceInstanceLink';

export function ServiceBindingData({ metadata, spec, status }) {
  const { t } = useTranslation();
  const { namespaceUrl } = useUrl();

  const { data, loading } = useGet(
    `/api/v1/namespaces/${metadata.namespace}/secrets/${spec.secretName}`,
    {
      pollingInterval: 5000,
    },
  );
  const secretExists = !!data;

  const list = [
    {
      name: t('btp-service-bindings.instance-name'),
      value: (
        <ServiceInstanceLink
          namespace={metadata.namespace}
          serviceInstanceName={spec.serviceInstanceName}
        />
      ),
    },
    {
      name: t('btp-service-bindings.secret'),
      value:
        secretExists || loading ? (
          <Link
            className="fd-link"
            to={namespaceUrl(`secrets/${spec.secretName}`)}
          >
            {spec.secretName}
          </Link>
        ) : (
          <Tooltip
            content={t('btp-service-bindings.tooltips.secret-not-found')}
          >
            {spec.secretName}
          </Tooltip>
        ),
    },
    { name: t('btp-service-bindings.external-name'), value: spec.externalName },
    {
      name: t('btp-service-bindings.binding-id'),
      value: status.bindingID || EMPTY_TEXT_PLACEHOLDER,
    },
    {
      name: t('btp-service-bindings.instance-id'),
      value: status.instanceID || EMPTY_TEXT_PLACEHOLDER,
    },
  ];

  return (
    <DefinitionList
      title={t('btp-service-bindings.data')}
      list={list}
      key="binding-data"
    />
  );
}
