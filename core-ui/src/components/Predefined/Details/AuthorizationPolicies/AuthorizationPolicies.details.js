import React from 'react';
import { useTranslation } from 'react-i18next';

import { EMPTY_TEXT_PLACEHOLDER } from 'react-shared';

export const AuthorizationPoliciesDetails = ({
  DefaultRenderer,
  ...otherParams
}) => {
  const { t } = useTranslation();

  const customColumns = [
    {
      header: t('authorizationpolicies.headers.action'),
      value: ({ spec }) => <p>{spec.action || EMPTY_TEXT_PLACEHOLDER}</p>,
    },
  ];

  return (
    <DefaultRenderer
      customColumns={customColumns}
      {...otherParams}
    ></DefaultRenderer>
  );
};
