import React from 'react';
import { LayoutPanelRow } from 'shared/components/LayoutPanelRow/LayoutPanelRow';
import { Tokens } from 'shared/components/Tokens';
import { GenericList } from 'shared/components/GenericList/GenericList';
import { useTranslation } from 'react-i18next';
import { UI5Panel } from 'shared/components/UI5Panel/UI5Panel';

export const LabelSelector = ({ selector, title }) => {
  const { t } = useTranslation();

  if (!selector) {
    return null;
  }

  if (selector.matchLabels)
    return (
      <UI5Panel
        title={title || t('network-policies.headers.pod-selector')}
        key="policy-types"
      >
        <LayoutPanelRow
          name={t('network-policies.headers.match-labels')}
          value={
            <Tokens
              tokens={
                Object.entries(selector.matchLabels).map(
                  ([key, value]) => `${key}=${value}`,
                ) || []
              }
            />
          }
        />
      </UI5Panel>
    );

  if (selector.matchExpressions) {
    const headerRenderer = () => [
      t('network-policies.headers.key'),
      t('network-policies.headers.operator'),
      t('network-policies.headers.values'),
    ];
    const rowRenderer = ({ key = '', operator = '', values = [] }) => [
      key,
      operator,
      <Tokens tokens={values} />,
    ];

    return (
      <GenericList
        title={title || t('network-policies.headers.pod-selector')}
        entries={selector.matchExpressions || []}
        headerRenderer={headerRenderer}
        rowRenderer={rowRenderer}
        key="policy-types"
        searchSettings={{
          showSearchField: false,
        }}
      />
    );
  }

  // selector defined but empty
  return (
    <UI5Panel
      title={title || t('network-policies.headers.pod-selector')}
      key="policy-types"
    >
      {t('network-policies.present-but-empty')}
    </UI5Panel>
  );
};
