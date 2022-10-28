import React from 'react';
import { useRecoilValue } from 'recoil';
import { SidebarNavigation } from 'sidebar/SidebarNavigation';
import { ErrorBoundary } from 'shared/components/ErrorBoundary/ErrorBoundary';
import { configFeaturesState } from 'state/configFeaturesAtom';
import { Footer } from './Footer/Footer';

import './Sidebar.scss';

export const Sidebar = () => {
  const pathname = window.location.pathname;
  const configFeatures = useRecoilValue(configFeaturesState);

  // turn on the feature locally to work on the new Navigation
  if (!configFeatures?.REACT_NAVIGATION?.isEnabled) return null;
  if (pathname === '/clusters') return null;

  return (
    <aside className="sidebar">
      <section className="sidebar__content">
        <ErrorBoundary customMessage="navigation error" displayButton={false}>
          <SidebarNavigation />
        </ErrorBoundary>
      </section>
      <section className="sidebar__footer">
        <Footer />
      </section>
    </aside>
  );
};
