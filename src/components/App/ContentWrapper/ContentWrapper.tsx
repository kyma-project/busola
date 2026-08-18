import { JSX } from 'react';
import './ContentWrapper.scss';

type ContentWrapperProps = {
  children: JSX.Element | JSX.Element[];
};

export const ContentWrapper = ({ children }: ContentWrapperProps) => {
  return (
    <main id="content-wrap">
      <div className="content-scroll">{children}</div>
    </main>
  );
};
