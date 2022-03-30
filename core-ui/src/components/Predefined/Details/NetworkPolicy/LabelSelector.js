import { LayoutPanel } from 'fundamental-react';
import { LayoutPanelRow } from 'shared/components/LayoutPanelRow/LayoutPanelRow';
import { Tokens } from 'shared/components/Tokens';
import { GenericList } from 'shared/components/GenericList/GenericList';
import React from 'react';
import { useTranslation } from 'react-i18next';

export const LabelSelector = ({ selector, title }) => {
  const { t, i18n } = useTranslation();

  if (!selector) {
    return null;
  }

  if (selector.matchLabels)
    return (
      <LayoutPanel className="fd-margin--md" key="policy-types">
        <LayoutPanel.Header>
          <LayoutPanel.Head
            title={title || t('network-policies.headers.pod-selector')}
          />
        </LayoutPanel.Header>
        <LayoutPanel.Body>
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
        </LayoutPanel.Body>
      </LayoutPanel>
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
        i18n={i18n}
        showSearchField={false}
      />
    );
  }

  // selector defined but empty
  return (
    <LayoutPanel className="fd-margin--md" key="policy-types">
      <LayoutPanel.Header>
        <LayoutPanel.Head
          title={title || t('network-policies.headers.pod-selector')}
        />
      </LayoutPanel.Header>
      <LayoutPanel.Body>
        {t('network-policies.present-but-empty')}
      </LayoutPanel.Body>
    </LayoutPanel>
  );
};
