import { useTranslation } from 'react-i18next';

import { useUrl } from 'hooks/useUrl';
import { ResourcesList } from 'shared/components/ResourcesList/ResourcesList';
import { ControlledBy } from 'shared/components/ControlledBy/ControlledBy';

import PodCreate from './PodCreate';
import { calculatePodState, PodStatus } from './PodStatus';
import PodRestarts from './PodRestarts';
import {
  ResourceDescription,
  i18nDescriptionKey,
  docsURL,
  PodType,
} from 'resources/Pods';
import { Link } from 'shared/components/Link/Link';
import { ResourcesListProps } from 'shared/components/ResourcesList/types';

type PodListProps = ResourcesListProps & {
  showNodeName?: boolean;
};

export function PodList({ showNodeName, ...props }: PodListProps) {
  const { clusterUrl } = useUrl();
  const { t } = useTranslation();

  let customColumns = [
    {
      header: t('common.headers.owner'),
      value: (pod: PodType) => {
        return (
          <ControlledBy
            ownerReferences={pod.metadata.ownerReferences}
            kindOnly
          />
        );
      },
    },
    {
      header: t('common.headers.status'),
      value: (pod: PodType) => <PodStatus pod={pod} />,
    },
    {
      header: t('pods.restarts'),
      value: (pod: PodType) => (
        <PodRestarts statuses={pod.status.containerStatuses} />
      ),
    },
  ];

  if (showNodeName) {
    customColumns = [
      ...customColumns,
      {
        header: t('pods.node'),
        value: (pod: PodType) => (
          <Link url={clusterUrl(`overview/nodes/${pod.spec.nodeName}`)}>
            {pod.spec.nodeName}
          </Link>
        ),
      },
    ];
  }

  return (
    <ResourcesList
      customColumns={customColumns}
      description={ResourceDescription}
      sortBy={(defaultSort) => ({
        ...defaultSort,
        status: (a, b) =>
          calculatePodState(a).status.localeCompare(
            calculatePodState(b).status,
          ),
      })}
      {...props}
      createResourceForm={PodCreate}
      emptyListProps={{
        subtitleText: i18nDescriptionKey,
        url: docsURL,
      }}
    />
  );
}

export default PodList;
