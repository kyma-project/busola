import { Button } from 'fundamental-react';
import { Labels } from 'shared/components/Labels/Labels';
import { useTranslation } from 'react-i18next';
import { ReadableCreationTimestamp } from 'shared/components/ReadableCreationTimestamp/ReadableCreationTimestamp';
import './DetailsCard.scss';
import { K8sResource } from 'types';
import { useNavigate } from 'react-router-dom';
import { useUrl } from 'hooks/useUrl';
import { useRecoilValue } from 'recoil';
import { clusterAndNsNodesSelector } from 'state/navigation/clusterAndNsNodesSelector';
import pluralize from 'pluralize';

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
  const nodes = useRecoilValue(clusterAndNsNodesSelector);

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
          className="fd-margin-end--sm"
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
          }}
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
