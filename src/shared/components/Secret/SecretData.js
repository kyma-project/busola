import React from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

import { Button } from '@ui5/webcomponents-react';
import { LayoutPanelRow } from '../LayoutPanelRow/LayoutPanelRow';
import './SecretData.scss';
import { base64Decode } from 'shared/helpers';
import { UI5Panel } from '../UI5Panel/UI5Panel';

const SecretComponent = ({ name, value, showEncoded, isCollapsed }) => (
  <LayoutPanelRow
    name={name}
    value={
      <pre className={isCollapsed ? 'show-more-expand' : 'show-more-collapse'}>
        {showEncoded ? value : base64Decode(value)}
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
  const [isCollapsed, setCollapsed] = React.useState(true);
  const [showExpandButton, setShowExpandButton] = React.useState(false);

  const decode = () => {
    setEncoded(true);
  };
  const encode = () => {
    setEncoded(false);
    setCollapsed(false);
  };

  const setShowExpand = async () => {
    const e = await document.getElementsByClassName('show-more-expand');

    [...e].forEach(el => {
      if (el.scrollWidth > el.clientWidth) {
        setShowExpandButton(true);
      }
    });
  };

  setShowExpand();

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
            isCollapsed={isCollapsed}
          />
        ))}
      </>
    );
  };

  return (
    <UI5Panel
      title={t('secrets.data')}
      headerActions={
        <>
          {showExpandButton && (
            <Button
              design="Transparent"
              icon={isCollapsed ? 'show' : 'hide'}
              disabled={!secret?.data}
              onClick={() => setCollapsed(!isCollapsed)}
            >
              {isCollapsed
                ? t('secrets.buttons.expand')
                : t('secrets.buttons.collapse')}
            </Button>
          )}
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
        </>
      }
    >
      {body()}
    </UI5Panel>
  );
}
