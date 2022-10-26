import { ReactElement, ReactNode } from 'react';
import { RecoilRoot } from 'recoil';
import { mount, MountRendererProps } from 'enzyme';

const AllTheProviders = ({ children }: { children: ReactNode }) => {
  return <RecoilRoot>{children}</RecoilRoot>;
};

const customMount = (node: ReactElement, options: MountRendererProps) =>
  mount(node, { wrappingComponent: AllTheProviders, ...options });

export * from 'enzyme';

export { customMount as mount };
