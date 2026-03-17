import { PodList } from 'resources/Pods/PodList';

interface RelatedPodsProps {
  namespace?: string;
  filter: (pod: any) => boolean;
}

export const RelatedPods = ({ namespace = '', filter }: RelatedPodsProps) => {
  const podListParams = {
    disableHiding: true,
    displayArrow: false,
    hasDetailsView: true,
    resourceUrl: `/api/v1/namespaces/${namespace}/pods`,
    resourceType: 'pods',
    namespace,
    isCompact: true,
    filter,
    showTitle: true,
    disableCreate: true,
    enableColumnLayout: false,
  };

  return <PodList {...podListParams} />;
};
