import { useRecoilValue } from 'recoil';
import { ErrorBoundary } from 'shared/components/ErrorBoundary/ErrorBoundary';
import { SidebarNavigation } from 'sidebar/SidebarNavigation';
import { configFeaturesState } from 'state/configFeatures/configFeaturesAtom';
import { isSidebarCondensedState } from 'state/preferences/isSidebarCondensedAtom';
import { Footer } from './Footer/Footer';

import './Sidebar.scss';

export const Sidebar = () => {
  const pathname = window.location.pathname;
  const configFeatures = useRecoilValue(configFeaturesState);
  const isSidebarCondensed = useRecoilValue(isSidebarCondensedState);

  // turn on the feature locally to work on the new Navigation
  if (!configFeatures?.REACT_NAVIGATION?.isEnabled) return null;
  if (pathname === '/clusters') return null;

  return (
    // <div
    //   style={{
    //     flexBasis: '260px',
    //     minWidth: isSidebarCondensed ? 'fit-content' : '260px',
    //     height: '100vh',
    //   }}
    // >
    <aside className="sidebar">
      <section className="sidebar__content">
        <ErrorBoundary customMessage="navigation error" displayButton={false}>
          <SidebarNavigation />
        </ErrorBoundary>
      </section>
      <Footer />
    </aside>
    // </div>
  );
};
