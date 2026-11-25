import { useTranslation } from 'react-i18next';
import { GenericList } from 'shared/components/GenericList/GenericList';
import { ResourceDetailsForm } from 'shared/components/ResourceDetails/ResourceDetailsForm';
import { ResourceDetailsFormItem } from 'shared/components/ResourceDetails/ResourceDetailsFormItem';
import { Tokens } from 'shared/components/Tokens';
import { UI5Card } from 'shared/components/UI5Card/UI5Card';
import { EMPTY_TEXT_PLACEHOLDER } from 'shared/constants';

interface IngressSpecificationProps {
  resource: any;
}

export const IngressSpecification = ({
  resource,
}: IngressSpecificationProps) => {
  const { t } = useTranslation();

  return (
    <>
      <UI5Card
        title={t('common.headers.specification')}
        accessibleName={t('common.accessible-name.specification')}
      >
        {resource.spec.ingressClassName && (
          <ResourceDetailsForm>
            <ResourceDetailsFormItem
              label={t('ingresses.labels.ingress-class-name')}
              value={resource.spec.ingressClassName}
            />
          </ResourceDetailsForm>
        )}
        {resource.spec?.tls && (
          <GenericList
            title={t('ingresses.labels.tls')}
            headerRenderer={() => [
              t('ingresses.labels.hosts'),
              t('ingresses.labels.secret-name'),
            ]}
            rowRenderer={(tls: any) => [
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
      </UI5Card>
    </>
  );
};
