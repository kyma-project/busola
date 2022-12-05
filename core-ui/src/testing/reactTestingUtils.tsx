import { ReactElement, ReactNode } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { MutableSnapshot, RecoilRoot } from 'recoil';

type CustomRenderOptions = Omit<RenderOptions, 'wrapper'> & {
  initializeState: (snapshot: MutableSnapshot) => void;
};

const customRender = (ui: ReactElement, options?: CustomRenderOptions) => {
  const AllTheProviders = ({ children }: { children: ReactNode }) => {
    return (
      <RecoilRoot initializeState={options?.initializeState}>
        {children}
      </RecoilRoot>
    );
  };

  return render(ui, { wrapper: AllTheProviders, ...options });
};

export * from '@testing-library/react';

export { customRender as render };
