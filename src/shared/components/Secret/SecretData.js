import React from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

import { Button } from '@ui5/webcomponents-react';
import { LayoutPanelRow } from '../LayoutPanelRow/LayoutPanelRow';
import './SecretData.scss';
import { base64Decode } from 'shared/helpers';
import { UI5Panel } from '../UI5Panel/UI5Panel';

const SecretComponent = ({ name, value, showEncoded, isInitial }) => (
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

export default function SecretData({ secret }) {
  const { t } = useTranslation();
  const [isEncoded, setEncoded] = React.useState(true);
  const [isInitial, setIsInitial] = React.useState(true);

  const decode = () => {
    setEncoded(true);
    setIsInitial(false);
  };
  const encode = () => {
    setEncoded(false);
    setIsInitial(false);
  };

  const body = () => {
    const SecretWrapper = ({ children }) => (
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
        {Object.keys(secret.data).map(key => (
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
