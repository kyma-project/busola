import React from 'react';
import { useTranslation } from 'react-i18next';
import { EMPTY_TEXT_PLACEHOLDER } from 'shared/constants';
import { DefinitionList } from '../../../../shared/components/DefinitionList/DefinitionList';

export function ServiceInstanceData({ spec, status }) {
  const { t } = useTranslation();
  const list = [
    {
      name: t('btp-instances.offering-name'),
      value: spec.serviceOfferingName,
    },
    {
      name: t('btp-instances.plan-name'),
      value: spec.servicePlanName,
    },
    {
      name: t('btp-instances.external-name'),
      value: spec.externalName,
    },
    {
      name: t('btp-instances.instance-id'),
      value: status.instanceID || EMPTY_TEXT_PLACEHOLDER,
    },
  ];

  return (
    <DefinitionList
      title={t('btp-instances.instance-data')}
      list={list}
      key="instance-data"
    />
  );
}
