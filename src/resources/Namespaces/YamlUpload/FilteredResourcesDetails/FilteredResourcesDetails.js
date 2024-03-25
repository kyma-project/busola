import React from 'react';
import { useTranslation } from 'react-i18next';
import { useRecoilValue } from 'recoil';
import {
  FlexBox,
  MessageStrip,
  ObjectStatus,
  Panel,
  Toolbar,
  ToolbarSpacer,
  ValueState,
} from '@ui5/webcomponents-react';
import {
  getExtendedValidateResourceState,
  validateResourcesState,
} from 'state/preferences/validateResourcesAtom';
import { useIsInCurrentNamespace } from 'shared/hooks/useIsInCurrentNamespace';
import { useValidateResourceBySchema } from 'shared/hooks/useValidateResourceBySchema/useValidateResourceBySchema';

import { Spinner } from 'shared/components/Spinner/Spinner';

import { validationSchemasEnabledState } from 'state/validationEnabledSchemasAtom';
import { useLoadingDebounce } from 'shared/hooks/useLoadingDebounce';

import { spacing } from '@ui5/webcomponents-react-base';
import './FilteredResourcesDetails.scss';

const useNamespaceWarning = resource => {
  const { t } = useTranslation();
  return useIsInCurrentNamespace(resource)
    ? []
    : [
        {
          key: 'different-namespace',
          message: t('upload-yaml.warnings.different-namespace', {
            namespace: resource?.metadata?.namespace,
          }),
        },
      ];
};

const ValidationWarning = ({ warning }) => {
  const [where, reason] = warning.split(' - ');
  return (
    <>
      <div>
        <p>{where}</p>
        <br />
        <p>{reason}</p>
      </div>
    </>
  );
};

const ValidationWarnings = ({ resource, validationSchema }) => {
  const { t } = useTranslation();

  const { debounced, loading } = useLoadingDebounce(resource, 500);

  const warnings = [
    useValidateResourceBySchema(debounced, validationSchema),
    useNamespaceWarning(debounced),
  ];

  // if the validationSchema is not yet available, set it to loading
  if (!validationSchema)
    return (
      <MessageStrip
        design="Warning"
        hideCloseButton
        style={spacing.sapUiSmallMarginBottom}
      >
        <p> {t('common.headers.loading')}</p>
        <Spinner size="Small" center={false} />
      </MessageStrip>
    );

  return (
    <>
      {warnings.flat().map(warning => (
        <>
          <FlexBox style={spacing.sapUiTinyMarginTopBottom}>
            <ObjectStatus
              showDefaultIcon
              state={ValueState.Warning}
              style={spacing.sapUiSmallMarginEnd}
            />
            <ValidationWarning warning={warning.message} />
          </FlexBox>
          <hr />
        </>
      ))}
    </>
  );
};

const ValidationResult = ({ resource }) => {
  const validateResources = getExtendedValidateResourceState(
    useRecoilValue(validateResourcesState),
  );
  const validationSchemas = useRecoilValue(validationSchemasEnabledState);
  const { debounced, loading } = useLoadingDebounce(resource, 500);
  const warnings = [
    useValidateResourceBySchema(debounced, validationSchemas),
    useNamespaceWarning(debounced),
  ];
  const statusIcon =
    warnings.flat().length !== 0 ? (
      <ObjectStatus showDefaultIcon state={ValueState.Warning} />
    ) : (
      <ObjectStatus showDefaultIcon state={ValueState.Success} />
    );

  return (
    <>
      <Panel
        collapsed={true}
        header={
          <Toolbar>
            {resource?.kind + ' ' + resource?.metadata?.name}
            <ToolbarSpacer />
            {statusIcon}
          </Toolbar>
        }
      >
        {validateResources.isEnabled && (
          <ValidationWarnings
            resource={resource}
            validationSchema={validationSchemas}
          />
        )}
      </Panel>
    </>
  );
};

export const FilteredResourcesDetails = ({ filteredResources }) => {
  return filteredResources.map(r => (
    <>
      <ValidationResult resource={r.value} />
    </>
  ));
};
