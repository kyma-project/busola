import React from 'react';

import { LabelsInput } from 'components/Lambdas/components';
import {
  Checkbox,
  FormFieldset,
  FormLabel,
  FormInput,
  InlineHelp,
  FormItem,
} from 'fundamental-react';
import { K8sNameInput } from 'react-shared';

export default function BasicData({ deployment, setDeployment }) {
  return (
    <FormFieldset>
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
      <FormItem>
        <FormLabel htmlFor="docker-image" required>
          Docker image
          <InlineHelp
            buttonLabel="help"
            placement="right-end"
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
      </FormItem>

      <h3 className="configuration-data__title">Service options</h3>
      <Checkbox
        defaultChecked={deployment.createService}
        value="Create Service"
        onChange={e =>
          setDeployment({ ...deployment, createService: e.target.checked })
        }
      >
        Create Service
      </Checkbox>
    </FormFieldset>
  );
}
