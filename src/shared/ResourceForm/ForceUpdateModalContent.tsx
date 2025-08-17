import { useTranslation } from 'react-i18next';
import { MessageStrip } from '@ui5/webcomponents-react';
import jsyaml from 'js-yaml';
import { useCreateDiffEditor } from 'shared/components/MonacoEditorESM/hooks/useCreateDiffEditor';
import { K8sResource } from 'types';

type ForceUpdateModalContentProps<TResourceType extends K8sResource> = {
  error: Error;
  singularName: string;
  initialResource: TResourceType;
  modifiedResource: TResourceType;
};

export function ForceUpdateModalContent({
  error,
  singularName,
  initialResource,
  modifiedResource,
}: ForceUpdateModalContentProps<K8sResource>) {
  const { t } = useTranslation();

  const toYaml = (obj: K8sResource) => {
    return jsyaml.dump(obj, {
      noRefs: true,
      // sort keys to generate a nicer diff
      sortKeys: (a: any, b: any) => a.toString().localeCompare(b.toString()),
    });
  };

  const { divRef } = useCreateDiffEditor({
    originalValue: toYaml(initialResource),
    modifiedValue: toYaml(modifiedResource),
    language: 'yaml',
  });

  return (
    <>
      <p className="sap-margin-bottom-small">
        {t('common.create-form.messages.patch-failure', {
          resourceType: singularName,
          error: error.message,
        })}
      </p>
      <div style={{ height: '400px' }} ref={divRef}></div>
      <MessageStrip
        design="Critical"
        hideCloseButton
        className="sap-margin-top-small"
      >
        {t('common.create-form.messages.force-update')}
      </MessageStrip>
    </>
  );
}
