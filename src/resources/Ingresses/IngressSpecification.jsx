import { useTranslation } from 'react-i18next';
import { GenericList } from 'shared/components/GenericList/GenericList';
import { LayoutPanelRow } from 'shared/components/LayoutPanelRow/LayoutPanelRow';
import { Tokens } from 'shared/components/Tokens';
import { UI5Panel } from 'shared/components/UI5Panel/UI5Panel';
import { EMPTY_TEXT_PLACEHOLDER } from 'shared/constants';

export const IngressSpecification = ({ resource }) => {
  const { t } = useTranslation();

  return (
    <>
      <UI5Panel title={t('common.headers.specification')}>
        {resource.spec.ingressClassName && (
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
            rowRenderer={tls => [
              tls?.hosts ? (
                <Tokens tokens={tls?.hosts} />
              ) : (
                EMPTY_TEXT_PLACEHOLDER
              ),
              tls?.secretName ?? EMPTY_TEXT_PLACEHOLDER,
            ]}
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
