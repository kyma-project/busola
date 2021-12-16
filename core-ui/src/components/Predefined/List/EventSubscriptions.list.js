import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link, StatusBadge } from 'react-shared';
import { Trans } from 'react-i18next';
//the name of the function cannot have 'Event' prefix, becuase it breaks list's and button's titles
export const SubscriptionsList = ({ DefaultRenderer, ...otherParams }) => {
  const { t, i18n } = useTranslation();
  const customColumns = [
    {
      header: 'Status',
      value: ({ status }) => {
        const lastCondition = status.conditions[status.conditions.length - 1];
        const statusBadgeProperties =
          lastCondition.status === 'False'
            ? {
                type: 'error',
                text: 'Error',
              }
            : {
                type: 'success',
                text: 'Ready',
              };
        return (
          <StatusBadge
            type={statusBadgeProperties.type}
            additionalContent={lastCondition?.message}
            i18n={i18n}
          >
            {statusBadgeProperties.text}
          </StatusBadge>
        );
      },
    },
  ];

  const description = (
    <Trans i18nKey="eventsSubscription">
      <Link
        className="fd-link"
        url="https://kyma-project.io/docs/kyma/latest/05-technical-reference/00-custom-resources/evnt-01-subscription/#documentation-content"
      />
    </Trans>
  );

  return (
    <DefaultRenderer
      resourceName="Event Subscriptions"
      customColumns={customColumns}
      description={description}
      {...otherParams}
    />
  );
};
