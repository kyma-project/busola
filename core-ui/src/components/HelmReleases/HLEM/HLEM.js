import React, { useState } from 'react';
import jsyaml from 'js-yaml';

export function HLEM({ release }) {
  const [loaded, setLoaded] = useState(false);

  async function load() {
    const go = new window.Go();
    const response = await fetch('/main.wasm');
    const buffer = await response.arrayBuffer();
    const obj = await WebAssembly.instantiate(buffer, go.importObject);
    go.run(obj.instance);

    setLoaded(true);
  }

  function doRender() {
    console.log(release.chart);
    const templates = release.chart.templates.map(f => ({
      name: f.name,
      data: jsyaml.dump(atob(f.data).replaceAll('\r\n', '\n')),
    }));
    console.log(templates);
    const metadata = release.chart.metadata;
    const values = { ...release.chart.values, ...release.config };

    window.helmDto = {
      templates,
      metadata: jsyaml.dump(metadata),
      values: jsyaml.dump(values),
    };

    window.render();

    Object.entries(window.helmDto.result).map(([k, v]) => {
      console.log(k);
      console.log(jsyaml.load(v.substring(1)));
    });
  }

  return (
    <div>
      {!loaded && <button onClick={load}>load go</button>}
      {loaded && <button onClick={doRender}>GOOO</button>}
    </div>
  );
}
