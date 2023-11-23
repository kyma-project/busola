import { Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { ErrorBoundary } from 'shared/components/ErrorBoundary/ErrorBoundary';
import { Spinner } from 'shared/components/Spinner/Spinner';
import { SidebarNavigation } from 'sidebar/SidebarNavigation';

import './Sidebar.scss';
import { spacing } from '@ui5/webcomponents-react-base';

const noSidebarPathnames = ['/clusters', '/no-permissions', '/gardener-login'];

export const Sidebar = () => {
  const { t } = useTranslation();
  const pathname = window.location.pathname;
  if (noSidebarPathnames.includes(pathname)) return null;

  return (
    <aside
      style={{
        ...spacing.sapUiTinyMarginEnd,
        ...spacing.sapUiTinyMarginTop,
      }}
    >
      <section className="sidebar__content">
        <Suspense fallback={<Spinner size="m" />}>
          <ErrorBoundary
            customMessage={t('navigation.errors.sidebar')}
            displayButton={false}
          >
            <SidebarNavigation />
          </ErrorBoundary>
        </Suspense>
      </section>
    </aside>
  );
};
