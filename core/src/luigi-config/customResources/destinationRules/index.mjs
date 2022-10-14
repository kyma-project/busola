import { form } from './form/index.mjs';
import { details } from './details/index.mjs';
import { translations } from './translations.mjs';

export const destinationRules = {
  general: {
    resource: {
      kind: 'DestinationRule',
      group: 'networking.istio.io',
      version: 'v1beta1',
    },
    name: 'Destination Rules',
    category: 'Istio',
    urlPath: 'destinationrules',
    scope: 'namespace',
    description: 'resource.description',
  },
  details,
  form,
  list: [
    {
      source: 'spec.host',
      name: 'Host',
    },
  ],
  translations,
};
