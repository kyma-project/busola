import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { useUrl } from 'hooks/useUrl';
import { useAtom, useAtomValue } from 'jotai';

import { Button, FormItem, Label, Text } from '@ui5/webcomponents-react';
import { Labels } from 'shared/components/Labels/Labels';
import { ReadableCreationTimestamp } from 'shared/components/ReadableCreationTimestamp/ReadableCreationTimestamp';
import { ResourceDetailsForm } from 'shared/components/ResourceDetails/ResourceDetailsForm';
import { K8sResource } from 'types';
import { allNodesAtomSync } from 'state/navigation/allNodesAtom';
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
  const nodes = useAtomValue(allNodesAtomSync);
  const [, setLayoutColumn] = useAtom(columnLayoutAtom);

  return (
    <div className="details-card-wrapper">
      <header className="details-card-header">
        <p className="resource-name">{resource.metadata.name}</p>
        <p className="resource-kind">{resource.kind}</p>
      </header>
      <section className="details-content">
        <ResourceDetailsForm singleColumn>
          <FormItem
            labelContent={
              <Label showColon>{t('common.headers.created')}</Label>
            }
          >
            <Text>
              <ReadableCreationTimestamp
                timestamp={resource.metadata.creationTimestamp}
              />
            </Text>
          </FormItem>
          <FormItem
            labelContent={<Label showColon>{t('common.headers.labels')}</Label>}
          >
            <Labels labels={resource.metadata.labels} />
          </FormItem>
        </ResourceDetailsForm>
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
                `${namespacePart}${node.resourceType}/${resource.metadata.name}?layout=TwoColumnsMidExpanded`,
              ),
            );

            setLayoutColumn({
              layout: 'TwoColumnsMidExpanded',
              startColumn: {
                resourceName: null,
                resourceType: node.resourceType,
                rawResourceTypeName: node.resourceTypeCased,
                namespaceId: resource.metadata.namespace,
                apiGroup: node.apiGroup,
                apiVersion: node.apiVersion,
              },
              midColumn: {
                resourceName: resource.metadata.name,
                resourceType: node.resourceType,
                rawResourceTypeName: node.resourceTypeCased,
                namespaceId: resource.metadata.namespace,
                apiGroup: node.apiGroup,
                apiVersion: node.apiVersion,
              },
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
