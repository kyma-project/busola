import { DevTools } from 'jotai-devtools';
import { Suspense } from 'react';
import { lazyWithRetries } from 'shared/helpers/lazyWithRetries';
const JotaiDevToolsStyling = lazyWithRetries(
  () => import('./JotaiDevToolsStyling'),
);

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
