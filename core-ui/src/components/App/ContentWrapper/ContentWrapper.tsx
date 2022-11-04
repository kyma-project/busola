import { useLocation } from 'react-router-dom';
import './ContentWrapper.scss';

type ContentWrapperProps = {
  children: JSX.Element;
};

export const ContentWrapper = ({ children }: ContentWrapperProps) => {
  const { pathname } = useLocation();

  return (
    <div
      id="content-wrap"
      className={pathname === '/clusters' ? 'sidebar-hidden' : ''}
    >
      {children}
    </div>
  );
};
