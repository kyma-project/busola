import { useNotification } from '../contexts/NotificationContext';
import { usePost } from './BackendAPI/usePost';
import { formatMessage, randomNameGenerator } from '../utils/helpers';

export const useCreateServiceBindingUsage = ({
  successMessage,
  errorMessage,
}) => {
  const postRequest = usePost();
  const notificationManager = useNotification();

  function handleError(serviceInstanceName, error) {
    console.error(error);
    const message = formatMessage(errorMessage, { serviceInstanceName });

    notificationManager.notifyError({
      content: message,
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

    const message = formatMessage(successMessage, { serviceInstanceName });

    notificationManager.notifySuccess({
      content: message,
    });
  }

  return createServiceBindingUsageSet;
};
