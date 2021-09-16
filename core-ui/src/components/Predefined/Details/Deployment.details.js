import React from 'react';
import { useTranslation } from 'react-i18next';
import { ControlledBy } from 'react-shared';

import { ResourcePods } from './ResourcePods.js';

export const DeploymentsDetails = ({ DefaultRenderer, ...otherParams }) => {
  const { t } = useTranslation();
  const customColumns = [
    {
      header: t('common.headers.owner'),
      value: deployment => (
        <ControlledBy ownerReferences={deployment.metadata.ownerReferences} />
      ),
    },
  ];
  return (
    <DefaultRenderer
      customComponents={[ResourcePods]}
      customColumns={customColumns}
      {...otherParams}
    ></DefaultRenderer>
  );
};
