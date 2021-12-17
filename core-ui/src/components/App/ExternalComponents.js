import React from 'react';
import { RemoteComponent } from 'RemoteComponent';
import { LayoutPanel } from 'fundamental-react';
import { useGet } from 'react-shared';
import createLoadRemoteModule from '@paciolan/remote-module-loader';

const loader = createLoadRemoteModule();
function useLoadRemoteFunction(url) {
  const [error, setError] = React.useState();
  const [fn, setFn] = React.useState();
  const [loading, setLoading] = React.useState(true);
  React.useEffect(() => {
    async function load() {
      try {
        //You can pass dependencies to the module. All modules loaded with this version of loadRemoteModule, will have the dependencies available to require.
        const module = await loader(url);
        setFn(() => module.default);
      } catch (e) {
        setError(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);
  return {
    fn,
    error,
    loading,
  };
}

const BASE_PLUGINS_URL = 'http://127.0.0.1:8099/plugins';
// 'https://raw.githubusercontent.com/Wawrzyn321/gardener-external-component/master/plugins';

export function ExternalComponents() {
  const {
    fn: plugin3,
    loading: loading3,
    error: error3,
  } = useLoadRemoteFunction(BASE_PLUGINS_URL + '/plugin-3/dist/main.js');

  return (
    <>
      Plugin 1
      <RemoteComponent
        url={BASE_PLUGINS_URL + '/plugin-1/dist/main.js'}
        name="test"
        Renderer={LayoutPanel}
      />
      Plugin 2
      <RemoteComponent
        url={BASE_PLUGINS_URL + '/plugin-2/dist/main.js'}
        useGet={useGet}
      />
      <div>
        Plugin 3:
        {plugin3 ? (
          <>
            <p>2 is odd? {plugin3.isOdd(2).toString()}</p>
            <p>3 is odd? {(!plugin3.isEven(3)).toString()}</p>
          </>
        ) : (
          'not yet or error'
        )}
      </div>
    </>
  );
}
