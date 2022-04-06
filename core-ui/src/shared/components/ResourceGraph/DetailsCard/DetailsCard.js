import React from 'react';
import { Button } from 'fundamental-react';
import { navigateToResource } from 'shared/hooks/navigate';
import { useTranslation } from 'react-i18next';
import { Labels } from 'shared/components/Labels/Labels';
import { ReadableCreationTimestamp } from 'shared/components/ReadableCreationTimestamp/ReadableCreationTimestamp';
import './DetailsCard.scss';

export function DetailsCard({ resource, handleCloseCard }) {
  const { t } = useTranslation();

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
