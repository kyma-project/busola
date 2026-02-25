import { Description } from 'shared/components/Description/Description';
import { lazyWithRetries } from 'shared/helpers/lazyWithRetries';

export const resourceType = 'kymas';
export const namespaced = false;
export const apiGroup = 'operator.kyma-project.io';
export const apiVersion = 'v1beta2';

export const List = lazyWithRetries(
  () => import('components/Modules/ModulesList'),
);
export const Create = lazyWithRetries(() => import('./KymaModulesEdit'));

export const ResourceDescription = (
  <Description
    i18nKey={'kyma-modules.description'}
    url={
      'https://help.sap.com/docs/btp/sap-business-technology-platform/kyma-s-modular-approach?locale=en-US&state=DRAFT&version=Cloud'
    }
  />
);
