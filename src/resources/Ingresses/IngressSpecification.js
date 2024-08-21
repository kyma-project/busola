import { useTranslation } from 'react-i18next';
import { GenericList } from 'shared/components/GenericList/GenericList';
import { LayoutPanelRow } from 'shared/components/LayoutPanelRow/LayoutPanelRow';
import { UI5Panel } from 'shared/components/UI5Panel/UI5Panel';

export const IngressSpecification = ({ resource }) => {
  const { t } = useTranslation();

  return (
    <>
      <UI5Panel title={t('common.headers.specification')}>
        {resource.spec && (
          <LayoutPanelRow
            name={t('ingresses.labels.ingress-class-name')}
            value={resource.spec.ingressClassName}
          />
        )}
        {resource.spec?.tls && (
          <GenericList
            title={t('ingresses.labels.tls')}
            headerRenderer={() => [
              t('ingresses.labels.hosts'),
              t('ingresses.labels.secret-name'),
            ]}
            rowRenderer={tls => [tls?.hosts.join(', '), tls?.secretName]}
            entries={resource.spec?.tls}
            searchSettings={{
              showSearchField: false,
            }}
          />
        )}
      </UI5Panel>
    </>
  );
};
