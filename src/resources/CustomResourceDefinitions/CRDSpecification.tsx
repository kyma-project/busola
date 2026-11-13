import { useTranslation } from 'react-i18next';
import { GenericList } from 'shared/components/GenericList/GenericList';
import { ResourceDetailsForm } from 'shared/components/ResourceDetails/ResourceDetailsForm';
import { ResourceDetailsFormItem } from 'shared/components/ResourceDetails/ResourceDetailsFormItem';
import { Tokens } from 'shared/components/Tokens';
import { UI5Panel } from 'shared/components/UI5Panel/UI5Panel';
import { FormGroup } from '@ui5/webcomponents-react';
import { EMPTY_TEXT_PLACEHOLDER } from 'shared/constants';

export const CRDSpecification = ({ spec }: { spec: any }) => {
  const { t } = useTranslation();

  return (
    <UI5Panel
      key="crd-specification"
      title={t('common.headers.specification')}
      accessibleName={t('common.accessible-name.specification')}
    >
      <ResourceDetailsForm>
        <FormGroup>
          <ResourceDetailsFormItem
            label={t('custom-resource-definitions.headers.scope')}
            value={spec?.scope}
          />
          <ResourceDetailsFormItem
            label={t('custom-resource-definitions.headers.categories')}
            value={<Tokens tokens={spec.names?.categories} />}
          />
          <ResourceDetailsFormItem
            label={t('custom-resource-definitions.headers.group')}
            value={spec?.group}
          />
        </FormGroup>
        {spec.conversion && (
          <FormGroup
            headerText={t('custom-resource-definitions.headers.conversion')}
          >
            <ResourceDetailsFormItem
              label={t('custom-resource-definitions.headers.strategy')}
              value={spec.conversion.strategy}
            />
            {spec.conversion?.webhook && (
              <>
                <ResourceDetailsFormItem
                  label={t('custom-resource-definitions.headers.service-name')}
                  value={spec.conversion?.webhook?.clientConfig?.service?.name}
                />
                <ResourceDetailsFormItem
                  label={t(
                    'custom-resource-definitions.headers.service-namespace',
                  )}
                  value={
                    spec.conversion?.webhook?.clientConfig?.service?.namespace
                  }
                />
                <ResourceDetailsFormItem
                  label={t('custom-resource-definitions.headers.service-port')}
                  value={spec.conversion?.webhook?.clientConfig?.service?.port}
                />
                <ResourceDetailsFormItem
                  label={t(
                    'custom-resource-definitions.headers.conversion-review-versions',
                  )}
                  value={
                    <Tokens
                      tokens={
                        spec.conversion?.webhook?.conversionReviewVersions
                      }
                    />
                  }
                />
              </>
            )}
          </FormGroup>
        )}
      </ResourceDetailsForm>
      {spec?.versions && (
        <GenericList
          title={t('custom-resource-definitions.headers.versions')}
          headerRenderer={() => [
            t('common.headers.name'),
            t('custom-resource-definitions.status.served'),
            t('custom-resource-definitions.status.storage'),
          ]}
          rowRenderer={(version) => [
            version?.name ?? EMPTY_TEXT_PLACEHOLDER,
            version?.served.toString() ?? EMPTY_TEXT_PLACEHOLDER,
            version?.storage.toString() ?? EMPTY_TEXT_PLACEHOLDER,
          ]}
          entries={spec?.versions}
          searchSettings={{
            showSearchField: false,
          }}
        />
      )}
    </UI5Panel>
  );
};
