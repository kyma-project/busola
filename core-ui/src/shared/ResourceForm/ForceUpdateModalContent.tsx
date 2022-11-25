import { useTranslation } from 'react-i18next';
import { MessageStrip } from 'fundamental-react';
import jsyaml from 'js-yaml';
import { useCreateDiffEditor } from 'shared/components/MonacoEditorESM/hooks/useCreateDiffEditor';
import { RecoilRoot } from 'recoil';

type ForceUpdateModalContentProps = {
  error: Error;
  singularName: string;
  initialResource: any;
  modifiedResource: any;
};

function ForceUpdateModalContentComponent({
  error,
  singularName,
  initialResource,
  modifiedResource,
}: ForceUpdateModalContentProps) {
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

export function ForceUpdateModalContent(props: ForceUpdateModalContentProps) {
  return (
    <RecoilRoot>
      <ForceUpdateModalContentComponent {...props} />
    </RecoilRoot>
  );
}
