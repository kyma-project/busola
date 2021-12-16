import React from 'react';

import { useTranslation } from 'react-i18next';

export const SubscriptionsDetails = ({ DefaultRenderer, ...otherParams }) => {
  const { t } = useTranslation();

  const customColumns = [];

  return <DefaultRenderer customColumns={customColumns} {...otherParams} />;
};
