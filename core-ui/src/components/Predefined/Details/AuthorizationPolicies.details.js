import React from 'react';
import { useTranslation } from 'react-i18next';

import { LayoutPanel } from 'fundamental-react';
import { LayoutPanelRow } from 'shared/components/LayoutPanelRow/LayoutPanelRow';

import { EMPTY_TEXT_PLACEHOLDER } from 'react-shared';

export const AuthorizationPoliciesDetails = ({
  DefaultRenderer,
  ...otherParams
}) => {
  const { t } = useTranslation();
  return (
    <DefaultRenderer
      singularName={t('authorizationpolicies.name_singular')}
      {...otherParams}
    />
  );
};
