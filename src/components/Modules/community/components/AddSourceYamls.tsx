import {
  Button,
  ComboBox,
  ComboBoxItem,
  FlexBox,
  Input,
  Label,
  List,
  ListItemCustom,
  ListItemStandard,
  MessageBox,
  MessageStrip,
  Text,
} from '@ui5/webcomponents-react';
import { Trans, useTranslation } from 'react-i18next';
import { createPortal } from 'react-dom';
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { usePost } from 'shared/hooks/BackendAPI/usePost';
import { useNotification } from 'shared/contexts/NotificationContext';

import { postForCommunityResources } from 'components/Modules/community/communityModulesHelpers';
import { useUploadResources } from 'resources/Namespaces/YamlUpload/useUploadResources';

import 'components/Modules/community/components/AddSourceYamls.scss';
import { HttpError } from 'shared/hooks/BackendAPI/config';
import { FlexBoxDirection } from '@ui5/webcomponents-react/dist/enums/FlexBoxDirection';
import { namespacesAtom } from 'state/namespacesAtom';
import { useAtomValue } from 'jotai';
import { HintButton } from 'shared/components/HintButton/HintButton';
import { ModuleTemplatesContext } from 'components/Modules/providers/ModuleTemplatesProvider';

import { DEFAULT_K8S_NAMESPACE } from 'components/Modules/support';
import { useUrl } from 'hooks/useUrl';
import { useNavigate } from 'react-router';
const DEFAULT_SOURCE_URL =
  'https://kyma-project.github.io/community-modules/all-modules.yaml';

export const AddSourceYamls = () => {
  const { t } = useTranslation();
  const notification = useNotification();
  const post = usePost();
  const { clusterUrl, namespaceUrl } = useUrl();
  const navigate = useNavigate();

  const [showAddSource, setShowAddSource] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sourceURL, setSourceURL] = useState(DEFAULT_SOURCE_URL);
  const [resourcesToApply, setResourcesToApply] = useState<{ value: any }[]>(
    [],
  );
  const [fetchedResources, setFetchedResources] = useState<{ value: any }[]>(
    [],
  );
  const [showDescription, setShowDescription] = useState(false);

  const allNamespaces = useAtomValue(namespacesAtom);
  const { communityModuleTemplates } = useContext(ModuleTemplatesContext);

  const checkIfTemplateExists = useCallback(() => {
    let foundMT: any[] = [];
    fetchedResources.forEach((resource) => {
      foundMT = foundMT.concat(
        communityModuleTemplates?.items?.filter((mt: any) => {
          return (
            mt.metadata.name === resource.value.metadata.name &&
            mt.spec.version === resource.value.spec.version
          );
        }),
      );
    });

    return foundMT;
  }, [fetchedResources, communityModuleTemplates]);

  const existingModuleTemplates = useMemo(
    () => checkIfTemplateExists(),
    [checkIfTemplateExists],
  );

  const uploadResources = useUploadResources(
    resourcesToApply,
    setResourcesToApply,
    () => {},
    DEFAULT_K8S_NAMESPACE,
  );

  const applyNamespace = (namespace: string) => {
    const namespacedResources = resourcesToApply.map((resource) => ({
      ...resource,
      value: {
        ...resource.value,
        metadata: { ...resource.value.metadata, namespace },
      },
    }));

    setResourcesToApply(namespacedResources);
  };

  useEffect(() => {
    if (!!!sourceURL) {
      setResourcesToApply([]);
      setError(null);
      return;
    }

    if (sourceURL.endsWith('.yaml')) {
      (async function () {
        try {
          const allResources = await postForCommunityResources(post, sourceURL);
          const allowedToApply = filterResources(allResources);
          const formatted = allowedToApply?.map((r: any) => {
            return { value: r };
          });

          setError(null);

          setFetchedResources(formatted);
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

  useEffect(() => {
    if (existingModuleTemplates.length > 0) {
      setResourcesToApply(
        fetchedResources.filter(
          (resource) =>
            !existingModuleTemplates.some(
              (mt: any) =>
                mt.metadata.name === resource.value.metadata.name &&
                mt.spec.version === resource.value.spec.version,
            ),
        ),
      );

      return;
    }
  }, [fetchedResources]); // eslint-disable-line react-hooks/exhaustive-deps

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

  const handleItemClick = async (name: string, namespace?: string) => {
    const path = `customresources/moduletemplates.operator.kyma-project.io/${name}`;
    const link = namespace
      ? namespaceUrl(path, { namespace: namespace || '-all-' })
      : clusterUrl(path);

    navigate(link);
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
              disabled={!!error || resourcesToApply.length === 0}
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
            <Label wrappingType="Normal">
              {t('modules.community.source-yaml.example-format')}
            </Label>
          </FlexBox>
          <FlexBox
            direction={FlexBoxDirection.Column}
            gap={'0.5rem'}
            className="sap-margin-top-small"
          >
            <FlexBox direction={FlexBoxDirection.Row} alignItems="Center">
              <Label for="source-url">
                {t('common.headers.namespace') + ':'}
              </Label>
              <HintButton
                setShowTitleDescription={setShowDescription}
                showTitleDescription={showDescription}
                description={
                  t(
                    'modules.community.source-yaml.namespace-description',
                  ) as string
                }
              ></HintButton>
            </FlexBox>
            <ComboBox
              id="yaml-namespace-combobox"
              onChange={(e) => applyNamespace(e.target.value)}
            >
              {allNamespaces?.map((ns) => (
                <ComboBoxItem text={ns} key={ns} />
              ))}
            </ComboBox>
          </FlexBox>
          {existingModuleTemplates.length > 0 && (
            <FlexBox
              direction={FlexBoxDirection.Column}
              gap={'0.5rem'}
              className="sap-margin-top-small"
            >
              <MessageStrip design="Critical" hideCloseButton>
                {t('modules.community.source-yaml.modules-wont-be-added')}
              </MessageStrip>
              <List>
                {existingModuleTemplates?.map((mt) => {
                  return (
                    <ListItemCustom
                      key={mt?.metadata.uid}
                      onClick={() => {
                        handleItemClick(
                          mt.metadata.name,
                          mt?.metadata.namespace,
                        );
                      }}
                    >
                      <Text>
                        <Trans
                          i18nKey={
                            'modules.community.source-yaml.module-already-exists'
                          }
                          values={{
                            moduleTemplate: `${mt.metadata.name} ${mt.spec.version ? ` (v${mt.spec.version})` : ''}`,
                            namespace: mt?.metadata.namespace,
                          }}
                        >
                          <span style={{ fontWeight: 'bold' }}></span>
                        </Trans>
                      </Text>
                    </ListItemCustom>
                  );
                })}
              </List>
            </FlexBox>
          )}
          <FlexBox
            direction={FlexBoxDirection.Column}
            gap={'0.5rem'}
            className="sap-margin-top-small"
          >
            <List
              header={
                <Text className="to-add-list-header">
                  {t('modules.community.source-yaml.module-templates-to-add')}
                </Text>
              }
            >
              {resourcesToApply.length === 0 && (
                <ListItemStandard>
                  <Text>
                    {t('modules.community.source-yaml.no-module-templates')}
                  </Text>
                </ListItemStandard>
              )}
              {resourcesToApply?.map((mt) => {
                return (
                  <ListItemCustom key={mt.value.metadata.uid}>
                    <Text>
                      {mt.value.metadata.name}
                      {mt.value.spec.version
                        ? ` (v${mt.value.spec.version})`
                        : ''}
                    </Text>
                  </ListItemCustom>
                );
              })}
            </List>
          </FlexBox>
        </MessageBox>,
        document.body,
      )}
    </>
  );
};
