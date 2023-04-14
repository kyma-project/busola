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

  if (typeof method !== 'string') {
    // error
  }

  const result = ResourceValidation[method](...parameters);

  self.postMessage(result);
};
