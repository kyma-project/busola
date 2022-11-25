import { useTranslation } from 'react-i18next';
import { MessageStrip } from 'fundamental-react';
import jsyaml from 'js-yaml';
import { useCreateDiffEditor } from 'shared/components/MonacoEditorESM/hooks/useCreateDiffEditor';
import { RecoilRoot } from 'recoil';
import { K8sResource } from 'types';

type ForceUpdateModalContentProps<TResourceType extends K8sResource> = {
  error: Error;
  singularName: string;
  initialResource: TResourceType;
  modifiedResource: TResourceType;
};

function ForceUpdateModalContentComponent({
  error,
  singularName,
  initialResource,
  modifiedResource,
}: ForceUpdateModalContentProps<K8sResource>) {
  const { t } = useTranslation();
  const { divRef } = useCreateDiffEditor({
    originalValue: jsyaml.dump(initialResource, { noRefs: true }),
    modifiedValue: jsyaml.dump(modifiedResource, { noRefs: true }),
    language: 'yaml',
  });

  return (
    <>
      <p className="fd-margin-bottom--sm">
        {t('common.create-form.messages.patch-failure', {
          resourceType: singularName,
          error: error.message,
        })}
      </p>
      <div style={{ height: '400px' }} ref={divRef}></div>
      <MessageStrip type="warning" className="fd-margin-top--sm">
        {t('common.create-form.messages.force-update')}
      </MessageStrip>
    </>
  );
}

// workaround for "This component must be used inside a <RecoilRoot> component."
export function ForceUpdateModalContent(
  props: ForceUpdateModalContentProps<K8sResource>,
) {
  return (
    <RecoilRoot>
      <ForceUpdateModalContentComponent {...props} />
    </RecoilRoot>
  );
}
