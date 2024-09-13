import { useTranslation } from 'react-i18next';
import { GenericList } from 'shared/components/GenericList/GenericList';
import { LayoutPanelRow } from 'shared/components/LayoutPanelRow/LayoutPanelRow';
import { Tokens } from 'shared/components/Tokens';
import { UI5Panel } from 'shared/components/UI5Panel/UI5Panel';
import { EMPTY_TEXT_PLACEHOLDER } from 'shared/constants';

export const CRDSpecification = ({ spec }: { spec: any }) => {
  const { t } = useTranslation();

  return (
    <>
      <UI5Panel title={t('common.headers.specification')}>
        <LayoutPanelRow
          name={t('custom-resource-definitions.headers.scope')}
          value={spec?.scope}
        />
        <LayoutPanelRow
          name={t('custom-resource-definitions.headers.categories')}
          value={<Tokens tokens={spec.names?.categories} />}
        />
        <LayoutPanelRow
          name={t('custom-resource-definitions.headers.group')}
          value={spec?.group}
        />

        <UI5Panel title={t('custom-resource-definitions.headers.conversion')}>
          {spec.conversion && (
            <>
              <LayoutPanelRow
                name={t('custom-resource-definitions.headers.strategy')}
                value={spec.conversion.strategy}
              />
              {spec.conversion?.webhook && (
                <>
                  <LayoutPanelRow
                    name={t('custom-resource-definitions.headers.service-name')}
                    value={
                      spec.conversion?.webhook?.clientConfig?.service?.name
                    }
                  />
                  <LayoutPanelRow
                    name={t(
                      'custom-resource-definitions.headers.service-namespace',
                    )}
                    value={
                      spec.conversion?.webhook?.clientConfig?.service?.namespace
                    }
                  />
                  <LayoutPanelRow
                    name={t('custom-resource-definitions.headers.service-port')}
                    value={
                      spec.conversion?.webhook?.clientConfig?.service?.port
                    }
                  />
                  <LayoutPanelRow
                    name={t(
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
            </>
          )}
        </UI5Panel>
        {spec?.versions && (
          <GenericList
            title={t('custom-resource-definitions.headers.versions')}
            headerRenderer={() => [
              t('common.headers.name'),
              t('custom-resource-definitions.status.served'),
              t('custom-resource-definitions.status.storage'),
            ]}
            rowRenderer={version => [
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
    </>
  );
};
