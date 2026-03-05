import { ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

import { Button } from '@ui5/webcomponents-react';
import { LayoutPanelRow } from '../LayoutPanelRow/LayoutPanelRow';
import './SecretData.scss';
import { base64Decode } from 'shared/helpers';
import { UI5Panel } from '../UI5Panel/UI5Panel';

type SecretComponentProps = {
  name: string;
  value: string;
  showEncoded: boolean;
  isInitial: boolean;
};

const SecretComponent = ({
  name,
  value,
  showEncoded,
  isInitial,
}: SecretComponentProps) => (
  <LayoutPanelRow
    name={name}
    value={
      <pre className={'secret'}>
        {isInitial ? '*****' : showEncoded ? value : base64Decode(value)}
      </pre>
    }
  />
);

SecretData.propTypes = {
  secret: PropTypes.object,
};

export default function SecretData({
  secret,
}: {
  secret: { data: Record<string, string> };
}) {
  const { t } = useTranslation();
  const [isEncoded, setEncoded] = useState(true);
  const [isInitial, setIsInitial] = useState(true);

  const decode = () => {
    setEncoded(true);
    setIsInitial(false);
  };
  const encode = () => {
    setEncoded(false);
    setIsInitial(false);
  };

  const body = () => {
    const SecretWrapper = ({ children }: { children: ReactNode }) => (
      <div className="secret-wrapper">{children}</div>
    );

    if (!secret) {
      return <SecretWrapper>{t('secrets.secret-not-found')}</SecretWrapper>;
    }
    if (!secret.data) {
      return <SecretWrapper>{t('secrets.secret-empty')}</SecretWrapper>;
    }

    return (
      <>
        {Object.keys(secret.data).map((key) => (
          <SecretComponent
            name={key}
            key={key}
            value={secret.data[key]}
            showEncoded={isEncoded}
            isInitial={isInitial}
          />
        ))}
      </>
    );
  };

  return (
    <UI5Panel
      title={t('secrets.data')}
      accessibleName={`${t('secrets.data')} panel`}
      headerActions={
        <Button
          design="Transparent"
          icon={isEncoded ? 'show' : 'hide'}
          disabled={!secret?.data}
          onClick={() => {
            return isEncoded ? encode() : decode();
          }}
        >
          {isEncoded
            ? t('secrets.buttons.decode')
            : t('secrets.buttons.encode')}
        </Button>
      }
    >
      {body()}
    </UI5Panel>
  );
}
