import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  CheckBox,
  List,
  ListItemStandard,
  MessageStrip,
  Text,
} from '@ui5/webcomponents-react';
import {
  checkIfAssociatedResourceLeft,
  deleteAssociatedResources,
  deleteCrResources,
  fetchResourceCounts,
  generateAssociatedResourcesUrls,
  getAssociatedResources,
  getCRResource,
  handleItemClick,
} from '../deleteModulesHelpers';
import { useNavigate } from 'react-router-dom';
import { useGetScope, useSingleGet } from 'shared/hooks/BackendAPI/useGet';
import { useUrl } from 'hooks/useUrl';
import pluralize from 'pluralize';
import { useDelete } from 'shared/hooks/BackendAPI/useMutation';
import { cloneDeep } from 'lodash';

export const ModulesListDeleteBox = ({
  handleModuleUninstall,
  DeleteMessageBox,
  setChosenModuleIndex,
  moduleTemplates,
  selectedModules,
  chosenModuleIndex,
  kymaResource,
  setKymaResourceState,
  setInitialUnchangedResource,
  kymaResourceState,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const getScope = useGetScope();
  const { clusterUrl, namespaceUrl } = useUrl();
  const deleteResourceMutation = useDelete();
  const fetchFn = useSingleGet();

  const [resourceCounts, setResourceCounts] = useState({});
  const [forceDeleteUrls, setForceDeleteUrls] = useState([]);
  const [crUrls, setCrUrls] = useState([]);
  const [allowForceDelete, setAllowForceDelete] = useState(false);
  const [associatedResourceLeft, setAssociatedResourceLeft] = useState(false);

  const associatedResources = useMemo(
    () =>
      getAssociatedResources(
        chosenModuleIndex,
        selectedModules,
        kymaResource,
        moduleTemplates,
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [chosenModuleIndex, moduleTemplates],
  );

  useEffect(() => {
    const fetchCounts = async () => {
      const counts = await fetchResourceCounts(associatedResources, fetchFn);

      const urls = await generateAssociatedResourcesUrls(
        associatedResources,
        fetchFn,
        clusterUrl,
        getScope,
        namespaceUrl,
        navigate,
      );

      const crUResources = getCRResource(
        chosenModuleIndex,
        selectedModules,
        kymaResource,
        moduleTemplates,
      );

      const crUrl = await generateAssociatedResourcesUrls(
        crUResources,
        fetchFn,
        clusterUrl,
        getScope,
        namespaceUrl,
        navigate,
      );

      setResourceCounts(counts);
      setForceDeleteUrls(urls);
      setCrUrls([crUrl]);
    };

    fetchCounts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [associatedResources]);

  useEffect(() => {
    const resourcesLeft = checkIfAssociatedResourceLeft(
      resourceCounts,
      associatedResources,
    );

    setAssociatedResourceLeft(resourcesLeft);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resourceCounts, associatedResources]);

  return (
    <DeleteMessageBox
      disableDeleteButton={associatedResourceLeft ? !allowForceDelete : false}
      customDeleteText={
        associatedResourceLeft && allowForceDelete
          ? 'common.buttons.cascade-delete'
          : null
      }
      cancelFn={() => {
        setAllowForceDelete(false);
        setChosenModuleIndex(null);
      }}
      additionalDeleteInfo={
        <>
          <Text>
            {t('kyma-modules.delete-module', {
              name: selectedModules[chosenModuleIndex]?.name,
            })}
          </Text>
          {associatedResources.length > 0 && (
            <>
              <MessageStrip
                design="Information"
                hideCloseButton
                className="sap-margin-top-small"
              >
                {t('kyma-modules.associated-resources-warning')}
              </MessageStrip>
              <List
                headerText={t('kyma-modules.associated-resources')}
                mode="None"
                separators="All"
              >
                {associatedResources.map(assResource => {
                  const resourceCount =
                    resourceCounts[
                      `${assResource.kind}-${assResource.group}-${assResource.version}`
                    ];

                  return (
                    <ListItemStandard
                      onClick={e => {
                        e.preventDefault();
                        handleItemClick(
                          assResource.kind,
                          assResource.group,
                          assResource.version,
                          clusterUrl,
                          getScope,
                          namespaceUrl,
                          navigate,
                        );
                      }}
                      type="Active"
                      key={`${assResource.kind}-${assResource.group}-${assResource.version}`}
                      additionalText={
                        (resourceCount === 0 ? '0' : resourceCount) ||
                        t('common.headers.loading')
                      }
                    >
                      {pluralize(assResource?.kind)}
                    </ListItemStandard>
                  );
                })}
              </List>
              {associatedResourceLeft && (
                <CheckBox
                  checked={allowForceDelete}
                  onChange={() => setAllowForceDelete(!allowForceDelete)}
                  accessibleName={t('kyma-modules.cascade-delete')}
                  text={t('kyma-modules.cascade-delete')}
                  className="sap-margin-top-tiny"
                />
              )}

              {associatedResourceLeft && allowForceDelete && (
                <MessageStrip
                  design="Critical"
                  hideCloseButton
                  className="sap-margin-y-small"
                >
                  {t('kyma-modules.cascade-delete-warning')}
                </MessageStrip>
              )}
            </>
          )}
        </>
      }
      resourceTitle={selectedModules[chosenModuleIndex]?.name}
      deleteFn={() => {
        if (allowForceDelete && forceDeleteUrls.length > 0) {
          deleteAssociatedResources(deleteResourceMutation, forceDeleteUrls);
        }
        selectedModules.splice(chosenModuleIndex, 1);
        setKymaResourceState({
          ...kymaResource,
          spec: {
            ...kymaResource.spec,
            modules: selectedModules,
          },
        });
        handleModuleUninstall();
        setInitialUnchangedResource(cloneDeep(kymaResourceState));
        if (allowForceDelete && forceDeleteUrls.length > 0) {
          deleteCrResources(deleteResourceMutation, crUrls);
        }
      }}
    />
  );
};
