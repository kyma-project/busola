import { useTranslation } from 'react-i18next';

import { ResourcesList } from 'shared/components/ResourcesList/ResourcesList';
import { EMPTY_TEXT_PLACEHOLDER } from 'shared/constants';

import IngressCreate from './IngressCreate';
import {
  ResourceDescription,
  i18nDescriptionKey,
  docsURL,
} from 'resources/Ingresses';

interface IngressListProps {
  [key: string]: any;
}

export function IngressList(props: IngressListProps) {
  const { t } = useTranslation();

  const getLoadBalancer = (service: any) => {
    if (service.status.loadBalancer?.ingress) {
      return service.status.loadBalancer?.ingress
        .map((endpoint: any) => endpoint.ip || endpoint.hostname)
        .join(', ');
    } else {
      return EMPTY_TEXT_PLACEHOLDER;
    }
  };

  const customColumns = [
    {
      header: t('ingresses.labels.load-balancers'),
      value: getLoadBalancer,
    },
  ];

  return (
    <ResourcesList
      customColumns={customColumns}
      description={ResourceDescription}
      {...(props as any)}
      createResourceForm={IngressCreate}
      emptyListProps={{
        subtitleText: i18nDescriptionKey,
        url: docsURL,
      }}
    />
  );
}

export default IngressList;
