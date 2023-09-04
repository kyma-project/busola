import { LayoutPanelRow } from 'shared/components/LayoutPanelRow/LayoutPanelRow';
import { Tokens } from 'shared/components/Tokens';
import { GenericList } from 'shared/components/GenericList/GenericList';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Panel, Title, Toolbar } from '@ui5/webcomponents-react';

export const LabelSelector = ({ selector, title }) => {
  const { t } = useTranslation();

  if (!selector) {
    return null;
  }

  if (selector.matchLabels)
    return (
      <Panel
        fixed
        className="fd-margin--md"
        key="policy-types"
        header={
          <Toolbar>
            <Title level="H5">
              {title || t('network-policies.headers.pod-selector')}
            </Title>
          </Toolbar>
        }
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
      </Panel>
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
    <Panel
      fixed
      className="fd-margin--md"
      key="policy-types"
      header={
        <Toolbar>
          <Title level="H5">
            {title || t('network-policies.headers.pod-selector')}
          </Title>
        </Toolbar>
      }
    >
      {t('network-policies.present-but-empty')}
    </Panel>
  );
};
