import React from 'react';
import { useTranslation } from 'react-i18next';

import { LayoutPanel } from 'fundamental-react';
import { LayoutPanelRow } from 'shared/components/LayoutPanelRow/LayoutPanelRow';
import { GoToDetailsLink, EMPTY_TEXT_PLACEHOLDER } from 'react-shared';

export const StorageClassesDetails = ({ DefaultRenderer, ...otherParams }) => {
  const { t } = useTranslation();

  return (
    <DefaultRenderer
      singularName={t('storage-classes.name_singular')}
      {...otherParams}
    />
  );
};
