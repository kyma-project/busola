import { Suspense } from 'react';
import { ErrorBoundary } from 'shared/components/ErrorBoundary/ErrorBoundary';
import { Spinner } from 'shared/components/Spinner/Spinner';
import { SidebarNavigation } from 'sidebar/SidebarNavigation';
import { Footer } from './Footer/Footer';

import './Sidebar.scss';

export const Sidebar = () => {
  const pathname = window.location.pathname;
  if (pathname === '/clusters' || pathname === '/no-permissions') return null;

  return (
    <aside className="sidebar">
      <Suspense fallback={<Spinner size="m" />}>
        <section className="sidebar__content">
          <ErrorBoundary customMessage="navigation error" displayButton={false}>
            <SidebarNavigation />
          </ErrorBoundary>
        </section>
        <Footer />
      </Suspense>
    </aside>
  );
};
