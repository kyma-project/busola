import { PodList } from 'resources/Pods/PodList';

export const RelatedPods = ({
  namespace = '',
  filter,
  disableMargin = false,
}) => {
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
    disableMargin,
    enableColumnLayout: false,
  };

  return <PodList {...podListParams} />;
};
