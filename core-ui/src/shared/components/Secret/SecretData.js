import React from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

import { Button, LayoutPanel } from 'fundamental-react';
import { LayoutPanelRow } from '../LayoutPanelRow/LayoutPanelRow';
import './SecretData.scss';
import { base64Decode } from 'shared/helpers';

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
      return <SecretWrapper>Secret not found</SecretWrapper>;
    }
    if (!secret.data) {
      return <SecretWrapper>Empty Secret</SecretWrapper>;
    }

    return (
      <LayoutPanel.Body>
        {Object.keys(secret.data).map(key => (
          <SecretComponent
            name={key}
            key={key}
            value={secret.data[key]}
            showEncoded={isEncoded}
            isCollapsed={isCollapsed}
          />
        ))}
      </LayoutPanel.Body>
    );
  };

  return (
    <LayoutPanel className="fd-margin--md secret-panel">
      <LayoutPanel.Header>
        <LayoutPanel.Head title={t('secrets.data')} />
        <LayoutPanel.Actions>
          {showExpandButton && (
            <Button
              option="transparent"
              glyph={isCollapsed ? 'show' : 'hide'}
              disabled={!secret?.data}
              onClick={() => setCollapsed(!isCollapsed)}
            >
              {isCollapsed
                ? t('secrets.buttons.expand')
                : t('secrets.buttons.collapse')}
            </Button>
          )}
          <Button
            option="transparent"
            glyph={isEncoded ? 'show' : 'hide'}
            disabled={!secret?.data}
            onClick={() => {
              return isEncoded ? encode() : decode();
            }}
          >
            {isEncoded
              ? t('secrets.buttons.decode')
              : t('secrets.buttons.encode')}
          </Button>
        </LayoutPanel.Actions>
      </LayoutPanel.Header>
      {body()}
    </LayoutPanel>
  );
}
