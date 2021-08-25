import React from 'react';

import {
  FormFieldset,
  FormLabel,
  FormInput,
  FormItem,
} from 'fundamental-react';

export default function ScalingData({ deployment, setDeployment }) {
  return (
    <div>
      <h3 className="configuration-data__title">Runtime Profile</h3>
      <FormFieldset className="configuration-data__form">
        <FormItem>
          <FormLabel required>Memory requests</FormLabel>
          <FormInput
            required
            defaultValue={deployment.requests.memory}
            onChange={e =>
              setDeployment({
                ...deployment,
                requests: {
                  ...deployment.requests,
                  memory: e.target.value,
                },
              })
            }
          />
        </FormItem>
        <FormItem>
          <FormLabel required>Memory limits</FormLabel>
          <FormInput
            required
            defaultValue={deployment.limits.memory}
            onChange={e =>
              setDeployment({
                ...deployment,
                limits: {
                  ...deployment.limits,
                  memory: e.target.value,
                },
              })
            }
          />
        </FormItem>
      </FormFieldset>
      <FormFieldset className="configuration-data__form">
        <FormItem>
          <FormLabel required>CPU requests</FormLabel>
          <FormInput
            required
            defaultValue={deployment.requests.cpu}
            onChange={e =>
              setDeployment({
                ...deployment,
                requests: {
                  ...deployment.requests,
                  cpu: e.target.value,
                },
              })
            }
          />
        </FormItem>
        <FormItem>
          <FormLabel required>CPU limits</FormLabel>
          <FormInput
            required
            defaultValue={deployment.limits.cpu}
            onChange={e =>
              setDeployment({
                ...deployment,
                limits: {
                  ...deployment.limits,
                  cpu: e.target.value,
                },
              })
            }
          />
        </FormItem>
      </FormFieldset>
    </div>
  );
}
