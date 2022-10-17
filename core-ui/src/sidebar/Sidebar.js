import React from 'react';
import { SidebarNavigation } from 'sidebar/SidebarNavigation';
import { useMicrofrontendContext } from 'shared/contexts/MicrofrontendContext';
import { ErrorBoundary } from 'shared/components/ErrorBoundary/ErrorBoundary';

export const Sidebar = () => {
  const { kubeconfig } = useMicrofrontendContext();

  if (!kubeconfig) return null;
  return (
    <aside>
      <section>
        <ErrorBoundary customMessage="navigation error" displayButton={false}>
          <SidebarNavigation />
        </ErrorBoundary>
      </section>
      <section>
        <footer> </footer>
      </section>
    </aside>
  );
};
