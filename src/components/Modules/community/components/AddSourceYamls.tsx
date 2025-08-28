import {
  Button,
  FlexBox,
  Input,
  Label,
  MessageBox,
} from '@ui5/webcomponents-react';
import { useTranslation } from 'react-i18next';
import { createPortal } from 'react-dom';
import { useEffect, useState } from 'react';
import { usePost } from 'shared/hooks/BackendAPI/usePost';
import { useNotification } from 'shared/contexts/NotificationContext';

import { postForCommunityResources } from 'components/Modules/community/communityModulesHelpers';
import { useUploadResources } from 'resources/Namespaces/YamlUpload/useUploadResources';

import 'components/Modules/community/components/AddSourceYamls.scss';
import { HttpError } from 'shared/hooks/BackendAPI/config';
import { FlexBoxDirection } from '@ui5/webcomponents-react/dist/enums/FlexBoxDirection';

const DEFAULT_SOURCE_URL =
  'https://kyma-project.github.io/community-modules/all-modules.yaml';

export const AddSourceYamls = () => {
  const { t } = useTranslation();
  const notification = useNotification();
  const post = usePost();

  const [showAddSource, setShowAddSource] = useState(false);
  const [error, setError] = useState<string | null>(null);
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

  useEffect(() => {
    if (sourceURL.endsWith('.yaml')) {
      (async function() {
        try {
          const allResources = await postForCommunityResources(post, sourceURL);
          const allowedToApply = filterResources(allResources);
          const formatted = allowedToApply?.map((r: any) => {
            return { value: r };
          });
          setError(null);
          setResourcesToApply(formatted);
        } catch (e) {
          if (e instanceof HttpError) {
            setError(
              t('modules.community.messages.source-yaml-fetch-failed', {
                error: e.message,
              }),
            );
          }
        }
      })();
    } else {
      setError(t('modules.community.messages.source-yaml-invalid-url'));
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
    if (error) {
      notification.notifyError({
        content: error,
      });
      return;
    }
    try {
      uploadResources();
      notification.notifySuccess({
        content: t('modules.community.messages.source-yaml-added'),
      });
      setShowAddSource(false);
    } catch (e) {
      console.error(e);
      notification.notifyError({
        content: t('modules.community.messages.source-yaml-failed'),
      });
    }
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
          titleText={t('modules.community.source-yaml.add-source-yaml')}
          actions={[
            <Button
              accessibleName="add-yamls"
              design="Emphasized"
              key="add-yamls"
              onClick={async () => {
                await handleApplySourceYAMLs();
              }}
            >
              {t('common.buttons.add')}
            </Button>,
            <Button
              accessibleName="cancel-add-yamls"
              design="Transparent"
              key="cancel-add-yamls"
              onClick={() => {
                setShowAddSource(false);
              }}
            >
              {t('common.buttons.cancel')}
            </Button>,
          ]}
        >
          <FlexBox direction={FlexBoxDirection.Column} gap={'0.5rem'}>
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
          </FlexBox>
        </MessageBox>,
        document.body,
      )}
    </>
  );
};
