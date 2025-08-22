import { Button, Input, MessageBox, Label } from '@ui5/webcomponents-react';
import { useTranslation } from 'react-i18next';
import { createPortal } from 'react-dom';
import { useState, useEffect } from 'react';
import { usePost } from 'shared/hooks/BackendAPI/usePost';

import { postForCommunityResources } from 'components/Modules/community/communityModulesHelpers';
import { useUploadResources } from 'resources/Namespaces/YamlUpload/useUploadResources';

import 'components/Modules/community/components/AddSourceYamls.scss';

const DEFAULT_SOURCE_URL =
  'https://kyma-project.github.io/community-modules/all-modules.yaml';

export const AddSourceYamls = () => {
  const { t } = useTranslation();
  const post = usePost();

  const [showAddSource, setShowAddSource] = useState(false);
  const [sourceURL, setSourceURL] = useState(DEFAULT_SOURCE_URL);
  const [resourcesToApply, setResourcesToApply] = useState<{ value: any }[]>(
    [],
  );

  const uploadResources = useUploadResources(
    resourcesToApply,
    setResourcesToApply,
    () => {},
    'default',
  );

  const getSourceYAML = async (sourceURL: string) => {
    return await postForCommunityResources(post, sourceURL);
  };

  useEffect(() => {
    if (sourceURL.endsWith('.yaml')) {
      (async function() {
        const allResources = await getSourceYAML(sourceURL);
        const allowedToApply = filterResources(allResources);

        const formatted = allowedToApply?.map((r: any) => {
          return { value: r };
        });

        setResourcesToApply(formatted);
      })();
    }
  }, [sourceURL]); // eslint-disable-line react-hooks/exhaustive-deps

  const filterResources = (resources: any) => {
    return (resources || []).filter(
      (resource: any) =>
        resource?.kind === 'ModuleTemplate' ||
        (resource?.kind === 'CustomResourceDefinition' &&
          resource?.metadata?.name ===
            'moduletemplates.operator.kyma-project.io'),
    );
  };

  const handleApplySourceYAMLs = async () => {
    uploadResources();
  };
  return (
    <>
      <Button
        accessibleName="add-yamls"
        design="Emphasized"
        key="add-yamls"
        onClick={() => {
          setShowAddSource(true);
        }}
      >
        {t('modules.community.source-yaml.add-source-yaml')}
      </Button>

      {createPortal(
        <MessageBox
          open={showAddSource}
          className="sourceurl-messagebox"
          onClose={() => {
            setShowAddSource(false);
          }}
          titleText={t('modules.community.source-yaml.add-source-yaml')}
          actions={[
            <Button
              accessibleName="add-yamls"
              design="Emphasized"
              key="add-yamls"
              onClick={async () => {
                handleApplySourceYAMLs();
              }}
            >
              {t('common.buttons.add')}
            </Button>,
            <Button
              accessibleName="cancel-add-yamls"
              design="Transparent"
              key="cancel-add-yamls"
            >
              {t('common.buttons.cancel')}
            </Button>,
          ]}
        >
          {' '}
          <div className="bsl-col-md--12">
            <Label for="source-url">
              {t('modules.community.source-yaml.source-yaml-url') + ':'}
            </Label>
            <Input
              type="Text"
              id="source-url"
              value={sourceURL}
              onInput={(e: any) => {
                setSourceURL((e.target as HTMLInputElement).value);
              }}
              accessibleName="Source YAML URL"
              showClearIcon
              className="full-width"
            />
            <Label wrappingType="Normal" style={{ marginTop: '5px' }}>
              {t('modules.community.source-yaml.example-format')}
            </Label>
          </div>
        </MessageBox>,
        document.body,
      )}
    </>
  );
};
