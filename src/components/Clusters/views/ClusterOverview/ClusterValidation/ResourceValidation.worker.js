/* eslint-disable no-restricted-globals */

import { validateResourceBySchema } from 'shared/hooks/useValidateResourceBySchema/useValidateResourceBySchema';

let validationRuleset;

const ResourceValidation = {
  validate(resources) {
    return resources.map(resource =>
      validateResourceBySchema(resource, validationRuleset),
    );
  },
  setRuleset(ruleset) {
    validationRuleset = ruleset;
  },
};

self.onmessage = event => {
  const [method, ...parameters] = event.data;

  if (method === 'validate') {
    const result = ResourceValidation.validate(...parameters);
    self.postMessage(result);
  } else if (method === 'setRuleset') {
    const result = ResourceValidation.setRuleset(...parameters);
    self.postMessage(result);
  }
};
