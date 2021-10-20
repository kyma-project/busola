import React from 'react';
import LuigiClient from '@luigi-project/client';
import { Link } from 'fundamental-react';
import { EMPTY_TEXT_PLACEHOLDER, useGet, Tooltip } from 'react-shared';
import { DefinitionList } from '../../../../shared/components/DefinitionList/DefinitionList';
import { useTranslation } from 'react-i18next';

export function ServiceBindingData({ metadata, spec, status }) {
  const { t } = useTranslation();
  const navigateToInstance = instanceName =>
    LuigiClient.linkManager()
      .fromContext('namespace')
      .navigate(`/btp-instances/details/${instanceName}`);

  const { data, loading } = useGet(
    `/api/v1/namespaces/${metadata.namespace}/secrets/${spec.secretName}`,
    {
      pollingInterval: 5000,
    },
  );
  const secretExists = !!data;

  const navigateToSecret = secretName =>
    LuigiClient.linkManager()
      .fromContext('namespace')
      .navigate(`/secrets/details/${secretName}`);

  const list = [
    {
      name: t('btp-service-bindings.instance-name'),
      value: (
        <Link
          className="fd-link"
          onClick={() => navigateToInstance(spec.serviceInstanceName)}
        >
          {spec.serviceInstanceName}
        </Link>
      ),
    },
    {
      name: t('btp-service-bindings.secret'),
      value:
        secretExists || loading ? (
          <Link
            className="fd-link"
            onClick={() => navigateToSecret(spec.secretName)}
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
