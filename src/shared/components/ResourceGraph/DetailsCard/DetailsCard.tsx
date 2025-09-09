import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { useUrl } from 'hooks/useUrl';
import { useAtom, useAtomValue } from 'jotai';

import { Button } from '@ui5/webcomponents-react';
import { Labels } from 'shared/components/Labels/Labels';
import { ReadableCreationTimestamp } from 'shared/components/ReadableCreationTimestamp/ReadableCreationTimestamp';
import { K8sResource } from 'types';
import { allNodesAtom } from 'state/navigation/allNodesAtom';
import pluralize from 'pluralize';
import { columnLayoutAtom } from 'state/columnLayoutAtom';

import './DetailsCard.scss';

export function DetailsCard({
  resource,
  handleCloseCard,
}: {
  resource: K8sResource;
  handleCloseCard: () => void;
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { clusterUrl } = useUrl();
  const nodes = useAtomValue(allNodesAtom);
  const [, setLayoutColumn] = useAtom(columnLayoutAtom);

  return (
    <div className="details-card-wrapper">
      <header className="details-card-header">
        <p className="resource-name">{resource.metadata.name}</p>
        <p className="resource-kind">{resource.kind}</p>
      </header>
      <section className="details-content">
        <p className="title">
          {t('common.headers.created')}&nbsp;
          <span>
            <ReadableCreationTimestamp
              timestamp={resource.metadata.creationTimestamp}
            />
          </span>
        </p>
        <div>
          <p className="title">{t('common.headers.labels')}</p>
          <Labels labels={resource.metadata.labels} />
        </div>
      </section>
      <div className="buttons-wrapper">
        <Button
          className="sap-margin-end-small"
          onClick={() => {
            const namespacePart = resource.metadata.namespace
              ? `namespaces/${resource.metadata.namespace}/`
              : '';

            const node = nodes.find(
              (n) =>
                n.resourceType.toLowerCase() ===
                pluralize(resource.kind!).toLowerCase(),
            )!;

            navigate(
              clusterUrl(
                `${namespacePart}${node.resourceType}/${resource.metadata.name}`,
              ),
            );

            setLayoutColumn({
              layout: 'OneColumn',
              startColumn: null,
              midColumn: null,
              endColumn: null,
            });
          }}
        >
          {t('resource-graph.buttons.go-to-details')}
        </Button>
        <Button
          className="sap-margin-end-small"
          onClick={() => handleCloseCard()}
        >
          {t('common.buttons.close')}
        </Button>
      </div>
    </div>
  );
}
