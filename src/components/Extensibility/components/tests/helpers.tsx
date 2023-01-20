import { DataSourcesContextProvider } from 'components/Extensibility/contexts/DataSources';
import { Suspense } from 'react';

type TestWrapperProps = {
  children: JSX.Element;
};

export const ExtensibilityTestWrapper = ({ children }: TestWrapperProps) => (
  <Suspense fallback="loading">
    <DataSourcesContextProvider dataSources={{}}>
      {children}
    </DataSourcesContextProvider>
  </Suspense>
);
