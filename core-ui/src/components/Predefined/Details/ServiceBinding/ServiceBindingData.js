import React from 'react';
import LuigiClient from '@luigi-project/client';
import { Link } from 'fundamental-react';
import { EMPTY_TEXT_PLACEHOLDER } from 'react-shared';
import { DefinitionList } from '../../../../shared/components/DefinitionList/DefinitionList';
import { useTranslation } from 'react-i18next';

export function ServiceBindingData({ spec, status }) {
  const { t } = useTranslation();
  const navigateToInstance = instanceName =>
    LuigiClient.linkManager()
      .fromContext('namespace')
      .navigate(`/btp-instances/details/${instanceName}`);

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
      value: (
        <Link
          className="fd-link"
          onClick={() => navigateToSecret(spec.secretName)}
        >
          {spec.secretName}
        </Link>
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
