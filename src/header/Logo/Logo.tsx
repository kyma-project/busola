import { FlexBox } from '@ui5/webcomponents-react';
import './Logo.scss';

export function Logo(props: any) {
  return (
    <FlexBox alignItems="Center" slot={props.slot}>
      <img
        alt="Kyma"
        src="https://sap.github.io/ui5-webcomponents/assets/images/sap-logo-svg.svg"
        style={{ height: '32px' }}
      />
      <div className="shellbar-title">Kyma</div>
    </FlexBox>
  );
}
