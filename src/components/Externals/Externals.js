import { useEffect, useState } from 'react';
import { useFetch } from 'shared/hooks/BackendAPI/useFetch';

export default function Externals() {
  const [src, setSrc] = useState(null);

  // const fetch = useFetch();
  const fetchSrc = async () => {
    const res = await fetch('https://ui-btp.a83a150.stage.kyma.ondemand.com/');

    const sth = await res.text();

    // const iframe = document.getElementById('iframe')?.contentWindow?.document?.write(`<html><body>${sth}</body></html>`);
    // console.log('lo iframe',iframe)
    return sth;
  };
  useEffect(() => {
    fetch('https://ui-btp.a83a150.stage.kyma.ondemand.com/').then(r => {
      console.log('roro r', r);
      r.text().then(t => {
        console.log('lolo t', t);
        setSrc(t);
      });
    });
    console.log('lolo', src);
  }, [src, setSrc]);

  return (
    <>
      <div>lo Externals</div>
      <iframe
        // src="http://127.0.0.1:8001/api/v1/namespaces/ak/services/nginx-service/proxy/"
        src="https://ui-btp.a83a150.stage.kyma.ondemand.com/"
        width="100%"
        height="50%"
        // style="border:none;"
        title="description"
      ></iframe>
      <iframe
        className="lolo"
        id="iframe"
        width="100%"
        height="50%"
        src="http://localhost:3001/backend/api/v1/namespaces/kyma-system/services/btp-manager-metrics-service:8080/proxy/"
        // srcDoc={src}
      ></iframe>
    </>
  );
}
