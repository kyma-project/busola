import { useGetList } from 'shared/hooks/BackendAPI/useGet';
import { Link } from 'react-router-dom';

import { useUrl } from 'hooks/useUrl';

export function ServiceInstanceLink({ namespace, serviceInstanceName }) {
  const { data: serviceInstances } = useGetList()(
    `/apis/services.cloud.sap.com/v1/namespaces/${namespace}/serviceinstances`,
  );
  const { resourceUrl } = useUrl();

  const serviceInstance = (serviceInstances || []).find(
    si => si.metadata.name === serviceInstanceName,
  );

  return serviceInstance ? (
    <Link className="fd-link" to={resourceUrl(serviceInstance)}>
      {serviceInstanceName}
    </Link>
  ) : (
    <p>{serviceInstanceName}</p>
  );
}
