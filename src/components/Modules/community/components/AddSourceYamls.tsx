import {
  Button,
  FlexBox,
  Input,
  Label,
  List,
  ListItemCustom,
  ListItemStandard,
  MessageBox,
  MessageStrip,
  OptionCustom,
  Text,
  Select,
  Icon,
} from '@ui5/webcomponents-react';
import { Trans, useTranslation } from 'react-i18next';
import { createPortal } from 'react-dom';
import { useContext, useEffect, useMemo, useState } from 'react';
import { usePost } from 'shared/hooks/BackendAPI/usePost';
import { useNotification } from 'shared/contexts/NotificationContext';

import { useUploadResources } from 'resources/Namespaces/YamlUpload/useUploadResources';

import { FlexBoxDirection } from '@ui5/webcomponents-react/dist/enums/FlexBoxDirection';
import { namespacesAtom } from 'state/namespacesAtom';
import { useAtomValue } from 'jotai';
import { HintButton } from 'shared/components/HintButton/HintButton';
import { ModuleTemplatesContext } from 'components/Modules/providers/ModuleTemplatesProvider';

import { DEFAULT_K8S_NAMESPACE } from 'components/Modules/support';
import { useUrl } from 'hooks/useUrl';
import { useNavigate } from 'react-router';
import { useGetYAMLModuleTemplates } from 'components/Modules/hooks';
import 'components/Modules/community/components/AddSourceYamls.scss';
import { Spinner } from 'shared/components/Spinner/Spinner';
import {
  OPERATION_STATE_INITIAL,
  OPERATION_STATE_SOME_FAILED,
  OPERATION_STATE_SUCCEEDED,
} from 'resources/Namespaces/YamlUpload/YamlUploadDialog';

const DEFAULT_SOURCE_URL =
  'https://kyma-project.github.io/community-modules/all-modules.yaml';

export const AddSourceYamls = () => {
  const { t } = useTranslation();
  const notification = useNotification();
  const post = usePost();
  const { clusterUrl, namespaceUrl } = useUrl();
  const navigate = useNavigate();

  const [showAddSource, setShowAddSource] = useState(false);
  const [addYamlsLoader, setAddYamlsLoader] = useState(false);
  const [lastOperationState, setLastOperationState] = useState(
    OPERATION_STATE_INITIAL,
  );
  const [sourceURL, setSourceURL] = useState(DEFAULT_SOURCE_URL);
  const [resourcesToApply, setResourcesToApply] = useState<{ value: any }[]>(
    [],
  );
  const [templatesNamespace, setTemplatesNamespace] = useState<string>(
    DEFAULT_K8S_NAMESPACE,
  );
  const [showDescription, setShowDescription] = useState(false);

  const {
    resources: fetchedResources,
    error,
    loading,
  } = useGetYAMLModuleTemplates(sourceURL, post);
  const allNamespaces = useAtomValue(namespacesAtom);
  const { communityModuleTemplates } = useContext(ModuleTemplatesContext);

  const existingModuleTemplates = useMemo(() => {
    const communityItems = communityModuleTemplates?.items || [];

    return fetchedResources.flatMap((resource: any) =>
      communityItems.filter(
        (mt: any) =>
          mt.metadata?.name === resource.value?.metadata?.name &&
          mt.spec?.version === resource.value?.spec?.version,
      ),
    );
  }, [fetchedResources, communityModuleTemplates]);

  const uploadResources = useUploadResources(
    resourcesToApply,
    setResourcesToApply,
    setLastOperationState,
    templatesNamespace,
  );

  const applyNamespace = (namespace: string) => {
    const namespacedResources = resourcesToApply.map((resource) => ({
      ...resource,
      value: {
        ...resource.value,
        metadata: { ...resource.value.metadata, namespace: namespace },
      },
    }));

    setTemplatesNamespace(namespace);

    setResourcesToApply(namespacedResources);
  };

  useEffect(() => {
    if (lastOperationState === OPERATION_STATE_SUCCEEDED) {
      setAddYamlsLoader(false);
      setShowAddSource(false);
      notification.notifySuccess({
        content: t('modules.community.messages.source-yaml-added'),
      });
    }
    if (lastOperationState === OPERATION_STATE_SOME_FAILED) {
      setAddYamlsLoader(false);
      notification.notifyError({
        content: t('modules.community.messages.source-yaml-failed'),
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastOperationState]);

  useEffect(() => {
    if (existingModuleTemplates.length > 0) {
      setResourcesToApply(
        fetchedResources.filter(
          (resource: any) =>
            !existingModuleTemplates.some(
              (mt: any) =>
                mt.metadata.name === resource.value.metadata.name &&
                mt.spec.version === resource.value.spec.version,
            ),
        ),
      );

      return;
    }

    setResourcesToApply(fetchedResources);
  }, [fetchedResources, existingModuleTemplates]);

  const handleApplySourceYAMLs = async () => {
    if (error) {
      setAddYamlsLoader(false);
      notification.notifyError({
        content: error,
      });
      return;
    }
    try {
      uploadResources();
      // Closing and notification for success is made when checking lastOperationState (useEffect).
    } catch (e) {
      setAddYamlsLoader(false);
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

  const handleClose = (action?: string) => {
    /* It fires on every action, but we want to show the loader when adding.
      `1: custom action` - Add
      `2: custom action` - Cancel
      undefined - ESC
    */
    if (action === '1: custom action') {
      return;
    }
    setSourceURL(DEFAULT_SOURCE_URL);
    setResourcesToApply([]);
    setShowDescription(false);
    setShowAddSource(false);
    setAddYamlsLoader(false);
  };

  return (
    <>
      <Button
        accessibleName="add-yamls"
        key="add-yamls"
        slot="action"
        onClick={() => {
          setShowAddSource(true);
        }}
      >
        {t('common.buttons.add')}
      </Button>

      {showAddSource &&
        createPortal(
          <MessageBox
            open={showAddSource}
            className="sourceurl-messagebox"
            titleText={t('modules.community.source-yaml.add-source-yaml')}
            onClose={handleClose}
            actions={[
              addYamlsLoader ? <Spinner key="add-yamls-loader" /> : null,
              <Button
                accessibleName="add-yamls"
                design="Emphasized"
                key="add-yamls"
                disabled={
                  !!error || resourcesToApply.length === 0 || addYamlsLoader
                }
                onClick={async () => {
                  setAddYamlsLoader(true);
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
              <Select
                id="yaml-namespace-select"
                data-testid="yaml-namespace-select"
                onChange={(e) => applyNamespace(e.target.value)}
                className="namespace-select"
              >
                <OptionCustom key="Empty namespace"></OptionCustom>
                {allNamespaces?.map((ns) => {
                  if (ns === 'kyma-system')
                    return (
                      <OptionCustom
                        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                        // @ts-expect-error
                        disabled
                        value={ns}
                        key={ns}
                      >
                        <div className="option-content">
                          {ns}
                          <Icon name="locked" />
                        </div>
                      </OptionCustom>
                    );
                  return (
                    <OptionCustom value={ns} key={ns}>
                      {ns}
                    </OptionCustom>
                  );
                })}
              </Select>
            </FlexBox>
            {loading ? (
              <Spinner />
            ) : (
              <>
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
                      {existingModuleTemplates?.map((mt: any) => {
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
                        {t(
                          'modules.community.source-yaml.module-templates-to-add',
                        )}
                      </Text>
                    }
                  >
                    {resourcesToApply.length === 0 && (
                      <ListItemStandard key="no-modules-to-add">
                        <Text>
                          {t(
                            'modules.community.source-yaml.no-module-templates',
                          )}
                        </Text>
                      </ListItemStandard>
                    )}
                    {resourcesToApply?.map((mt) => {
                      return (
                        <ListItemCustom key={mt.value.metadata.name}>
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
              </>
            )}
          </MessageBox>,
          document.body,
        )}
    </>
  );
};
