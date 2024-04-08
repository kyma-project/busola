import { FlexBox, Title } from '@ui5/webcomponents-react';
import { useTranslation } from 'react-i18next';

export function Logo(props: any) {
  const { t } = useTranslation();

  return (
    <FlexBox alignItems="Center" slot={props.slot}>
      <img
        alt="SAP"
        src="https://www.sap.com/dam/application/shared/logos/sap-logo-svg.svg/sap-logo-svg.svg"
        style={{ height: '32px' }}
      />
      <Title level="H5">{t('common.product-title')}</Title>
    </FlexBox>
  );
}
