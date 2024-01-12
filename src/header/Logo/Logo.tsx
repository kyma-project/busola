import { FlexBox, Title } from '@ui5/webcomponents-react';
import { useTranslation } from 'react-i18next';

export function Logo(props: any) {
  const { t } = useTranslation();

  return (
    <FlexBox alignItems="Center" slot={props.slot}>
      <img
        alt="SAP"
        src="https://sap.github.io/ui5-webcomponents/assets/images/sap-logo-svg.svg"
        style={{ height: '32px' }}
      />
      <Title level="H5">{t('common.product-title')}</Title>
    </FlexBox>
  );
}
