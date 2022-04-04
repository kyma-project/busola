import React from 'react';
import { useTranslation } from 'react-i18next';

import LambdaDetailsWrapper from 'components/Lambdas/LambdaDetails/LambdaDetailsWrapper';
import { prettySourceType } from 'components/Lambdas/helpers/lambdas';
import { prettyRuntime } from 'components/Lambdas/helpers/runtime';
import { LambdaStatusBadge } from 'components/Lambdas/LambdaStatusBadge/LambdaStatusBadge';
import { ResourceDetails } from 'shared/components/ResourceDetails/ResourceDetails';
import { FunctionsCreate } from '../../Create/Functions/Functions.create';

const FunctionsDetails = props => {
  const { t } = useTranslation();
  const customColumns = [
    {
      header: t('common.headers.status'),
      value: resource => (
        <LambdaStatusBadge
          resourceKind={props.resourceType}
          status={resource.status}
        />
      ),
    },
    {
      header: t('functions.headers.source-type'),
      value: resource => prettySourceType(resource.spec.type, t),
    },
    {
      header: t('functions.headers.runtime'),
      value: resource => prettyRuntime(resource.spec.runtime),
    },
    {
      header: t('functions.headers.runtime-image-override'),
      value: resource => resource.spec.runtimeImageOverride,
      enabled: resource => resource.spec.runtimeImageOverride,
    },
  ];

  const Functions = resource => {
    return <LambdaDetailsWrapper key="lambdaDetails" lambda={resource} />;
  };
  return (
    <ResourceDetails
      customColumns={customColumns}
      customComponents={[Functions]}
      createResourceForm={FunctionsCreate}
      {...props}
    />
  );
};

export default FunctionsDetails;
