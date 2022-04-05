import React from 'react';
import './DetailsCard.scss';
import { Button } from 'fundamental-react';
import { navigateToResource } from 'shared/hooks/navigate';
import { useTranslation } from 'react-i18next';

export function DetailsCard({ resource, handleCloseModal }) {
  console.log(resource);

  const { t } = useTranslation();
  return (
    <div className="details-card-wrapper">
      <header className="details-card-header">
        {/* <div className="name-wrapper"> */}
        <p className="resource-name">{resource?.metadata?.name}</p>
        {/* </div> */}
        <p className="resource-kind">{resource?.kind}</p>
      </header>
      <section className="details-content"></section>
      <div className="buttons-wrapper">
        <Button
          className="fd-margin-end--sm"
          onClick={() => navigateToResource(resource)}
        >
          {t('resource-graph.buttons.go-to-details')}
        </Button>
        <Button
          className="fd-margin-end--sm"
          onClick={() => handleCloseModal()}
        >
          {t('common.buttons.close')}
        </Button>
      </div>
    </div>
  );
}
