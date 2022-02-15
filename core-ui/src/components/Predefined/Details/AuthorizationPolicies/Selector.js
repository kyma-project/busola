import React from 'react';
import { useTranslation } from 'react-i18next';
import { LayoutPanel } from 'fundamental-react';
import { LayoutPanelRow } from 'shared/components/LayoutPanelRow/LayoutPanelRow';

import { Labels } from 'react-shared';

export const Selector = policy => {
  const { t } = useTranslation();

  return (
    <LayoutPanel className="fd-margin--md" key={'ap-selector'}>
      <LayoutPanel.Header>
        <LayoutPanel.Head title={t('authorizationpolicies.headers.selector')} />
      </LayoutPanel.Header>
      <LayoutPanel.Body>
        <LayoutPanelRow
          name={t('authorizationpolicies.headers.match-labels')}
          value={<Labels labels={policy.spec.selector?.matchLabels} />}
        />
      </LayoutPanel.Body>
    </LayoutPanel>
  );
};
