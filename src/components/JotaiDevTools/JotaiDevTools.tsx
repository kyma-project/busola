import { DevTools } from 'jotai-devtools';
import { lazy, Suspense } from 'react';
const JotaiDevToolsStyling = lazy(() => import('./JotaiDevToolsStyling'));

function JotaiDevTools() {
  return (
    <Suspense fallback={null}>
      <JotaiDevToolsStyling>
        <DevTools position="bottom-right" />
      </JotaiDevToolsStyling>
    </Suspense>
  );
}

export default JotaiDevTools;
