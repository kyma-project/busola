import React from 'react';

import { LayoutPanel } from 'fundamental-react';
import { LayoutPanelRow } from 'shared/components/LayoutPanelRow/LayoutPanelRow';

export function GenericListRenderer({
  onChange,
  onKeyDown,
  value,
  schema,
  storeKeys,
  required,
}) {
  return (
    <LayoutPanel className="fd-margin--md secret-panel">
      <LayoutPanel.Header>
        <LayoutPanel.Head title={'Title'} />
      </LayoutPanel.Header>
      <LayoutPanel.Body>
        {Object.keys(secret.data).map(key => (
          <LayoutPanelRow name={''} value={<pre>{''}</pre>} />
        ))}
      </LayoutPanel.Body>
    </LayoutPanel>
  );
}
{
  /* <GenericList
  textSearchProperties={textSearchProperties}
  showSearchSuggestion={false}
  entries={entries}
  headerRenderer={headerRenderer}
  rowRenderer={rowRenderer}
  actions={actions}
  extraHeaderContent={extraHeaderContent}
  noSearchResultMessage={t('clusters.list.no-clusters-found')}
  i18n={i18n}
  allowSlashShortcut
/>; */
}
