import React from 'react';
import { useTranslation } from 'react-i18next';

import FunctionDetailsWrapper from 'components/Functions/FunctionDetails/FunctionDetailsWrapper';
import { prettySourceType } from 'components/Functions/helpers/functions';
import { prettyRuntime } from 'components/Functions/helpers/runtime';
import { FunctionStatusBadge } from 'components/Functions/FunctionStatusBadge/FunctionStatusBadge';
import { ResourceDetails } from 'shared/components/ResourceDetails/ResourceDetails';
import { FunctionCreate } from './FunctionCreate';

export function FunctionDetails(props) {
  const { t } = useTranslation();
  const customColumns = [
    {
      header: t('common.headers.status'),
      value: resource => (
        <FunctionStatusBadge
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
  ];

  const Functions = resource => {
    return <FunctionDetailsWrapper key="functionDetails" func={resource} />;
  };
  return (
    <ResourceDetails
      customColumns={customColumns}
      customComponents={[Functions]}
      createResourceForm={FunctionCreate}
      {...props}
    />
  );
}

export default FunctionDetails;
