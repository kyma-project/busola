import { FlexBox, Title } from '@ui5/webcomponents-react';
import { useTranslation } from 'react-i18next';

export function Logo(props: any) {
  const { t } = useTranslation();

  return (
    <FlexBox className="header-logo" alignItems="Center" slot={props.slot}>
      <img alt="SAP" src="\assets\sap-logo.svg" />
      <Title level="H5">{t('common.product-title')}</Title>
    </FlexBox>
  );
}
