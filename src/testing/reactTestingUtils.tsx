import { ReactElement, ReactNode } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { Provider, WritableAtom } from 'jotai';
import { useHydrateAtoms } from 'jotai/utils';
import { BrowserRouter } from 'react-router';

type CustomRenderOptions = Omit<RenderOptions, 'wrapper'> & {
  initialAtoms?: Iterable<[WritableAtom<unknown, any[], unknown>, unknown]>;
};

// Component to initialize Jotai atoms with test data
export function JotaiHydrator({
  initialValues,
  children,
}: {
  initialValues?: Iterable<[WritableAtom<unknown, any[], unknown>, unknown]>;
  children: ReactNode;
}) {
  useHydrateAtoms(new Map(initialValues ?? []));
  return <>{children}</>;
}

const customRender = (ui: ReactElement, options?: CustomRenderOptions) => {
  const AllTheProviders = ({ children }: { children: ReactNode }) => {
    return (
      <Provider>
        <JotaiHydrator initialValues={options?.initialAtoms}>
          <BrowserRouter>{children}</BrowserRouter>
        </JotaiHydrator>
      </Provider>
    );
  };

  return render(ui, { wrapper: AllTheProviders, ...options });
};

export * from '@testing-library/react';

export { customRender as render };
