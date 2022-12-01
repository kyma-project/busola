import './ContentWrapper.scss';

type ContentWrapperProps = {
  children: JSX.Element;
};

export const ContentWrapper = ({ children }: ContentWrapperProps) => {
  const { pathname } = window.location;

  const reactNavEnabled = true;
  return (
    <div
      id="content-wrap"
      className={
        !reactNavEnabled || pathname === '/clusters' ? 'sidebar-hidden' : ''
      }
    >
      {children}
    </div>
  );
};
