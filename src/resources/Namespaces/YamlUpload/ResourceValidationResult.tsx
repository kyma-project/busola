import { Fragment } from 'react';
import { useTranslation } from 'react-i18next';
import { useAtomValue } from 'jotai';
import {
  FlexBox,
  MessageStrip,
  ObjectStatus,
  Panel,
} from '@ui5/webcomponents-react';
import { Toolbar } from '@ui5/webcomponents-react-compat/dist/components/Toolbar/index.js';
import { ToolbarSpacer } from '@ui5/webcomponents-react-compat/dist/components/ToolbarSpacer/index.js';
import {
  getExtendedValidateResourceState,
  validateResourcesAtom,
} from 'state/settings/validateResourcesAtom';
import { useIsInCurrentNamespace } from 'shared/hooks/useIsInCurrentNamespace';
import { useValidateResourceBySchema } from 'shared/hooks/useValidateResourceBySchema/useValidateResourceBySchema';

import { Spinner } from 'shared/components/Spinner/Spinner';

import { validationSchemasEnabledAtom } from 'state/validationEnabledSchemasAtom';
import { useLoadingDebounce } from 'shared/hooks/useLoadingDebounce';

import { SeparatorLine } from './SeparatorLine';
import { ValidationSchema } from 'state/validationSchemasAtom';

const useNamespaceWarning = (resource: any) => {
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

const ValidationWarning = ({ warning }: { warning: string }) => {
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

const ValidationWarnings = ({
  resource,
  validationSchema,
}: {
  resource: any;
  validationSchema: ValidationSchema;
}) => {
  const { t } = useTranslation();

  const { debounced } = useLoadingDebounce(resource, 500);

  const warnings = [
    useValidateResourceBySchema(debounced, validationSchema),
    useNamespaceWarning(debounced),
  ];

  // if the validationSchema is not yet available, set it to loading
  if (!validationSchema)
    return (
      <MessageStrip
        design="Critical"
        hideCloseButton
        className="sap-margin-bottom-small"
      >
        <p> {t('common.headers.loading')}</p>
        <Spinner size="S" center={false} />
      </MessageStrip>
    );

  return (
    <>
      {warnings.flat().map((warning, idx) => (
        <Fragment key={idx}>
          <FlexBox alignItems="Start">
            <ObjectStatus
              showDefaultIcon
              aria-label="Warning"
              state="Critical"
              className="sap-margin-end-small"
              style={{
                marginLeft: '-0.3125rem', //set icon in one line with expand arrow. The value from class `--_ui5_panel_content_padding` is divided by 2
              }}
            />
            <ValidationWarning
              warning={
                typeof warning === 'string' ? warning : (warning.message ?? '')
              }
            />
          </FlexBox>
          <SeparatorLine
            className="sap-margin-y-small"
            style={{
              marginLeft: '-1rem',
              marginRight: '-1rem',
            }}
          />
        </Fragment>
      ))}
    </>
  );
};

export const ResourceValidationResult = ({ resource }: { resource: any }) => {
  const validateResources = getExtendedValidateResourceState(
    useAtomValue(validateResourcesAtom),
  );
  const validationSchemas = useAtomValue(validationSchemasEnabledAtom);
  const { debounced } = useLoadingDebounce(resource, 500);
  const warnings = [
    useValidateResourceBySchema(debounced, validationSchemas),
    useNamespaceWarning(debounced),
  ];
  const statusIcon = validateResources.isEnabled ? (
    warnings.flat().length !== 0 ? (
      <ObjectStatus showDefaultIcon aria-label="Warning" state="Critical" />
    ) : (
      <ObjectStatus showDefaultIcon state="Positive" aria-label="Positive" />
    )
  ) : (
    <div></div>
  ); //empty div to overwrite overflow button

  return (
    <>
      <Panel
        collapsed={true}
        hidden={!validateResources.isEnabled}
        fixed={!validateResources.isEnabled}
        style={{
          padding: 0,
          paddingLeft: 0,
          paddingRight: 0,
          marginLeft: '-1rem',
          marginRight: '-1rem',
        }}
        header={
          <Toolbar toolbarStyle={'Clear'} slot="header">
            {resource?.kind + ' ' + resource?.metadata?.name}
            <ToolbarSpacer />
            {statusIcon}
          </Toolbar>
        }
        accessibleName={resource?.kind + ' ' + resource?.metadata?.name}
        role="listitem"
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
