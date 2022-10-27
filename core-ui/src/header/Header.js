import React from 'react';
import LuigiClient from '@luigi-project/client';
import { useMicrofrontendContext } from 'shared/contexts/MicrofrontendContext';

import './Header.scss';

export const Header = () => {
  const { features } = useMicrofrontendContext();

  if (!features?.REACT_NAVIGATION?.isEnabled) return null;

  return (
    <header className="header">
      <section className="header__left">
        <div
          onClick={() => {
            LuigiClient.linkManager()
              .fromContext('cluster')
              .navigate('');
          }}
        >
          Kyma Logo
        </div>
      </section>
      <section className="header__right">dropdown</section>
    </header>
  );
};
