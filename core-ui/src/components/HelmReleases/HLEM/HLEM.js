import React, { useState } from 'react';
import jsyaml from 'js-yaml';
import { partition } from 'lodash';

function getTemplateData(data) {
  return jsyaml.dump(
    atob(data)
      .replaceAll(new RegExp('{{ index \\(lookup.*?}}', 'g'))
      .replaceAll('\r\n', '\n'),
  );
}

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
    const metadata = release.chart.metadata;
    const values = { ...release.chart.values, ...release.config };
    const [helpers, templates] = partition(release.chart.templates, t =>
      t.name.endsWith('.tpl'),
    );
    const decodedHelpers = helpers.map(h => ({
      name: h.name,
      data: getTemplateData(h.data),
    }));

    for (const template of templates) {
      const name = template.name;
      const data = getTemplateData(template.data);

      const { result, error } = window.render({
        templates: [{ name, data }, ...decodedHelpers],
        metadata: jsyaml.dump(metadata),
        values: jsyaml.dump(values),
      });

      console.log(name);
      if (result) {
        console.log(jsyaml.load(jsyaml.load(result.replace(/^\s+/, ''))));
      } else {
        console.log(error);
      }
    }
  }

  return (
    <div>
      {!loaded && <button onClick={load}>load go</button>}
      {loaded && <button onClick={doRender}>GOOO</button>}
    </div>
  );
}
