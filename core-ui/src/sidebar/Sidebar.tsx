// import { useRecoilValue } from 'recoil';
// import { configFeaturesState } from 'state/configFeatures/configFeaturesAtom';
import { ErrorBoundary } from 'shared/components/ErrorBoundary/ErrorBoundary';
import { SidebarNavigation } from 'sidebar/SidebarNavigation';
import { Footer } from './Footer/Footer';

import './Sidebar.scss';

export const Sidebar = () => {
  const pathname = window.location.pathname;
  // const configFeatures = useRecoilValue(configFeaturesState);

  // if (!configFeatures?.REACT_NAVIGATION?.isEnabled || pathname === '/clusters')
  if (pathname === '/clusters') return null;

  return (
    <aside className="sidebar">
      <section className="sidebar__content">
        <ErrorBoundary customMessage="navigation error" displayButton={false}>
          <SidebarNavigation />
        </ErrorBoundary>
      </section>
      <Footer />
    </aside>
  );
};
