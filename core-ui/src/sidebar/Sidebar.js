import React from 'react';
import { SidebarNavigation } from 'sidebar/SidebarNavigation';
import { useMicrofrontendContext } from 'shared/contexts/MicrofrontendContext';
import { ErrorBoundary } from 'shared/components/ErrorBoundary/ErrorBoundary';
import { Footer } from './Footer/Footer';

import './Sidebar.scss';

export const Sidebar = () => {
  const { features } = useMicrofrontendContext();

  // turn on the feature locally to work on the new Navigation
  if (!features?.REACT_NAVIGATION?.isEnabled) return null;

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
