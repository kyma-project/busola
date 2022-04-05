import React from 'react';
import './DetailsCard.scss';
import { Button } from 'fundamental-react';
import { navigateToResource } from 'shared/hooks/navigate';
import { useTranslation } from 'react-i18next';
import { GoToDetailsLink } from 'shared/components/ControlledBy/ControlledBy';
import { SubscriptionConditionStatus } from 'shared/components/SubscriptionConditionStatus';
import { Labels } from 'shared/components/Labels/Labels';
import { ReadableCreationTimestamp } from 'shared/components/ReadableCreationTimestamp/ReadableCreationTimestamp';
import { LayoutPanelRow } from 'shared/components/LayoutPanelRow/LayoutPanelRow';
export function DetailsCard({ resource, handleCloseCard }) {
  const { t } = useTranslation();

  const tempCustomColumns = [
    {
      header: t('subscriptions.headers.conditions.status'),
      value: ({ status }) => {
        const lastCondition = {
          status: 'True',
        };
        return <SubscriptionConditionStatus condition={lastCondition} />;
      },
    },
    {
      header: t('common.headers.owner'),
      value: () => {
        return (
          <p>
            {t('services.name_singular')}&nbsp;
            <GoToDetailsLink resource="services" name={'serviceName'} />
          </p>
        );
      },
    },
    {
      header: t('subscriptions.sink'),
      value: () => <p>"just a sink"</p>,
    },
  ];

  return (
    <div className="details-card-wrapper">
      <header className="details-card-header">
        <p className="resource-name">{resource?.metadata?.name}</p>
        <p className="resource-kind">{resource?.kind}</p>
      </header>
      <section className="details-content">
        <p className="title">
          {t('common.headers.created')}&nbsp;
          <span>
            <ReadableCreationTimestamp
              timestamp={resource?.metadata?.creationTimestamp}
            />
          </span>
        </p>
        <div>
          <p className="title">{t('common.headers.labels')}</p>
          <Labels labels={resource?.metadata?.labels} />
        </div>
        {tempCustomColumns?.map(({ header, value: Component }) => {
          return (
            <div>
              <LayoutPanelRow
                name={header}
                value={<Component />}
                key={header}
              />
            </div>
          );
        })}
      </section>
      <div className="buttons-wrapper">
        <Button
          className="fd-margin-end--sm"
          onClick={() => navigateToResource(resource)}
        >
          {t('resource-graph.buttons.go-to-details')}
        </Button>
        <Button className="fd-margin-end--sm" onClick={() => handleCloseCard()}>
          {t('common.buttons.close')}
        </Button>
      </div>
    </div>
  );
}
