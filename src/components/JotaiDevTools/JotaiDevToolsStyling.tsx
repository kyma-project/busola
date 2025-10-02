import 'jotai-devtools/styles.css';

// This is to conditionally lazy-load styles for dev tools.
// This prevents them from loading in production and causing problems in testing.
function JotaiDevToolsStyling({
  children,
}: Readonly<{ children?: React.ReactNode }>) {
  return <>{children}</>;
}

export default JotaiDevToolsStyling;
