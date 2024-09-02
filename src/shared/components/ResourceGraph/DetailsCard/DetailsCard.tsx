import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useUrl } from 'hooks/useUrl';
import { useRecoilState, useRecoilValue } from 'recoil';

import { Button } from '@ui5/webcomponents-react';
import { Labels } from 'shared/components/Labels/Labels';
import { ReadableCreationTimestamp } from 'shared/components/ReadableCreationTimestamp/ReadableCreationTimestamp';
import { K8sResource } from 'types';
import { allNodesSelector } from 'state/navigation/allNodesSelector';
import pluralize from 'pluralize';

import { spacing } from '@ui5/webcomponents-react-base';
import './DetailsCard.scss';
import { columnLayoutState } from 'state/columnLayoutAtom';

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
  const nodes = useRecoilValue(allNodesSelector);
  const [, setLayoutColumn] = useRecoilState(columnLayoutState);

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
          style={spacing.sapUiSmallMarginEnd}
          onClick={() => {
            const namespacePart = resource.metadata.namespace
              ? `namespaces/${resource.metadata.namespace}/`
              : '';

            const node = nodes.find(
              n =>
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
              midColumn: null,
              endColumn: null,
            });
          }}
        >
          {t('resource-graph.buttons.go-to-details')}
        </Button>
        <Button
          style={spacing.sapUiSmallMarginEnd}
          onClick={() => handleCloseCard()}
        >
          {t('common.buttons.close')}
        </Button>
      </div>
    </div>
  );
}
