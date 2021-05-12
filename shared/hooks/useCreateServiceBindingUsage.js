import { useNotification } from '../contexts/NotificationContext';
import { usePost } from './BackendAPI/usePost';
import { randomNameGenerator } from '../utils/helpers';

export const useCreateServiceBindingUsage = () => {
  const postRequest = usePost();
  const notificationManager = useNotification();

  function handleError(error) {
    console.error(error);

    notificationManager.notifyError({
      title: `Failed to create the Resource`,
      content: error.message || error,
      autoClose: false,
    });
  }

  async function createServiceBinding(name, namespace, instanceRefName) {
    return await postRequest(
      `/apis/servicecatalog.k8s.io/v1beta1/namespaces/${namespace}/servicebindings/${name}`,
      {
        apiVersion: 'servicecatalog.k8s.io/v1beta1',
        kind: 'ServiceBinding',
        metadata: {
          name,
          namespace,
        },
        spec: {
          instanceRef: {
            name: instanceRefName,
          },
        },
      },
    );
  }

  async function createServiceBindingUsage(
    name,
    namespace,
    serviceBindingName,
    parameters,
    usedBy,
  ) {
    return await postRequest(
      `/apis/servicecatalog.kyma-project.io/v1alpha1/namespaces/${namespace}/servicebindingusages/${name}`,
      {
        apiVersion: 'servicecatalog.kyma-project.io/v1alpha1',
        kind: 'ServiceBindingUsage',
        metadata: {
          name,
        },
        spec: {
          serviceBindingRef: {
            name: serviceBindingName,
          },
          usedBy,
          parameters,
        },
      },
    );
  }

  async function createServiceBindingUsageSet({
    namespace,
    serviceInstanceName,
    serviceBindingUsageParameters,
    existingCredentials = undefined,
    usedBy,
  }) {
    try {
      let serviceBindingName = existingCredentials || randomNameGenerator();

      if (!existingCredentials)
        await createServiceBinding(
          serviceBindingName,
          namespace,
          serviceInstanceName,
        );

      await createServiceBindingUsage(
        randomNameGenerator(),
        namespace,
        serviceBindingName,
        serviceBindingUsageParameters,
        usedBy,
      );
    } catch (err) {
      handleError(serviceInstanceName, err);
      return;
    }

    notificationManager.notifySuccess({
      content: 'Resource created',
    });
  }

  return createServiceBindingUsageSet;
};
