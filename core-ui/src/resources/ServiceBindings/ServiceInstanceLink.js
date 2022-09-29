import { useGetList } from 'shared/hooks/BackendAPI/useGet';
import { Link } from 'fundamental-react';
import { navigateToResource } from 'shared/hooks/navigate';

export function ServiceInstanceLink({ namespace, serviceInstanceName }) {
  const { data: serviceInstances } = useGetList()(
    `/apis/services.cloud.sap.com/v1/namespaces/${namespace}/serviceinstances`,
  );

  const serviceInstance = (serviceInstances || []).find(
    si => si.metadata.name === serviceInstanceName,
  );

  return serviceInstance ? (
    <Link onClick={() => navigateToResource(serviceInstance)}>
      {serviceInstanceName}
    </Link>
  ) : (
    <p>{serviceInstanceName}</p>
  );
}
