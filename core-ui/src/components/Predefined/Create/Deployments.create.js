import React from 'react';
import {
  createDeploymentTemplate,
  formatDeployment,
} from '../Details/Namespace/CreateWorkloadForm/helpers';
import { usePost, K8sNameInput, useMicrofrontendContext } from 'react-shared';
import { InlineHelp, FormLabel, FormInput } from 'fundamental-react';
import { LabelsInput } from 'components/Lambdas/components';

export function DeploymentsCreate({
  formElementRef,
  onChange,
  onCompleted,
  onError,
  resourceUrl,
  refetchList,
}) {
  const { namespaceId } = useMicrofrontendContext();
  const [deployment, setDeployment] = React.useState(
    createDeploymentTemplate(namespaceId),
  );
  const postRequest = usePost();

  async function handleFormSubmit(e) {
    e.preventDefault();
    const input = formatDeployment(deployment);
    try {
      await postRequest(resourceUrl, input);
      refetchList();
      onCompleted(`Deployment ${deployment.name} created`);
    } catch (e) {
      onError('Cannot create Deployment', `Error: ${e.message}`);
    }
  }

  return (
    <form ref={formElementRef} onChange={onChange} onSubmit={handleFormSubmit}>
      <K8sNameInput
        id="name"
        kind="Deployment"
        onChange={e => setDeployment({ ...deployment, name: e.target.value })}
        className="fd-has-margin-bottom-s"
      />
      <LabelsInput
        labels={deployment.labels}
        onChange={labels => setDeployment({ ...deployment, labels })}
      />
      <FormLabel htmlFor="docker-image" required>
        Docker image
        <InlineHelp
          placement="bottom-right"
          text="Image should be a valid docker image registry path."
        />
      </FormLabel>
      <FormInput
        id="docker-image"
        required
        placeholder="Enter Docker image"
        onChange={e =>
          setDeployment({ ...deployment, dockerImage: e.target.value })
        }
        className="fd-has-margin-bottom-s"
      />
    </form>
  );
}
