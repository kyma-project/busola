import { ReactElement, ReactNode } from 'react';
import { RecoilRoot } from 'recoil';
import { mount, MountRendererProps } from 'enzyme';
import { BrowserRouter } from 'react-router-dom';

const AllTheProviders = ({ children }: { children: ReactNode }) => {
  return (
    <RecoilRoot>
      <BrowserRouter>{children}</BrowserRouter>
    </RecoilRoot>
  );
};

const customMount = (node: ReactElement, options: MountRendererProps) =>
  mount(node, { wrappingComponent: AllTheProviders, ...options });

export * from 'enzyme';

export { customMount as mount };
