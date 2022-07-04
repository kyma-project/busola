import React from 'react';
import { GenericList } from 'shared/components/GenericList/GenericList';
import { useTranslation } from 'react-i18next';
import { EMPTY_TEXT_PLACEHOLDER } from 'shared/constants';

export const NetworkPolicyPorts = ({ ports, title }) => {
  const { t, i18n } = useTranslation();

  if (!ports?.length) return null;

  const headerRenderer = () => [
    t('network-policies.headers.protocol'),
    t('network-policies.headers.port'),
    t('network-policies.headers.end-port'),
  ];
  const rowRenderer = ({ port, endPort, protocol }) => [
    protocol || EMPTY_TEXT_PLACEHOLDER,
    port || EMPTY_TEXT_PLACEHOLDER,
    endPort || EMPTY_TEXT_PLACEHOLDER,
  ];

  return (
    <GenericList
      title={title || t('network-policies.headers.ports')}
      entries={ports || []}
      headerRenderer={headerRenderer}
      rowRenderer={rowRenderer}
      i18n={i18n}
      showSearchField={false}
    />
  );
};
